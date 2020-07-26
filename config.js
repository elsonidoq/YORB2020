require('dotenv').config();

const config = {
  accessCode: process.env.ACCESS_CODE,
  publicIp: process.env.EXPOSED_IP || process.env.SERVER_IP,

  // http server ip, port, and peer timeout constant
  httpIp: process.env.SERVER_IP,
  httpPort: process.env.HTTP_PORT,
  httpPeerStale: 15000,

  // ssl certs. we'll start as http instead of https if we don't have
  // these
  sslCrt: process.env.SSL_CERT || 'certs/fullchain.pem',
  sslKey: process.env.SSL_KEY || 'certs/privkey.pem',

  mediasoup: {
    worker: {
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
      logLevel: 'debug',
      logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp',
        // 'rtx',
        // 'bwe',
        // 'score',
        // 'simulcast',
        // 'svc'
      ],
    },
    router: {
      mediaCodecs:
        [
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2
          },
          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters:
              {
//                'x-google-start-bitrate': 1000
              }
          },
          {
					  kind       : 'video',
					  mimeType   : 'video/h264',
					  clockRate  : 90000,
					  parameters :
					  {
						  'packetization-mode'      : 1,
						  'profile-level-id'        : '4d0032',
						  'level-asymmetry-allowed' : 1,
//						  'x-google-start-bitrate'  : 1000
					  }
				  },
				  {
					  kind       : 'video',
					  mimeType   : 'video/h264',
					  clockRate  : 90000,
					  parameters :
					  {
						  'packetization-mode'      : 1,
						  'profile-level-id'        : '42e01f',
						  'level-asymmetry-allowed' : 1,
//						  'x-google-start-bitrate'  : 1000
					  }
				  }
        ]
    },

    // rtp listenIps are the most important thing, below. you'll need
    // to set these appropriately for your network for the demo to
    // run anywhere but on localhost
    webRtcTransport: {
      listenIps: [
       { ip: '127.0.0.1', announcedIp: null },
       { ip: process.env.SERVER_IP, announcedIp: process.env.EXPOSED_IP },
      ],
      initialAvailableOutgoingBitrate: 800000,
    }
  }
};

// if we are in production environment, copy over config from .env file:
if (process.env.NODE_ENV == 'production') {
  config.sslCrt = process.env.PRODUCTION_CERT;
  config.sslKey = process.env.PRODUCTION_KEY;
  config.httpIp = process.env.PRODUCTION_IP;
  config.publicIp = process.env.PRODUCTION_IP;

  config.mediasoup.webRtcTransport.listenIps = [
    { ip: '127.0.0.1', announcedIp: null },
    { ip: process.env.PRODUCTION_IP, announcedIp: null }
  ];
}

module.exports = config;
