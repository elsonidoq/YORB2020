/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

module.exports = (THREE, isMobile = false) => {
    THREE.PointerLockControls = function (camera, domElement) {
        if (domElement === undefined) {

            console.warn('THREE.PointerLockControls: The second parameter "domElement" is now mandatory.');
            domElement = document.body;

        }

        this.domElement = domElement;
        this.isLocked = false;

        //
        // internals
        //

        var scope = this;

        var changeEvent = { type: 'change' };
        var lockEvent = { type: 'lock' };
        var unlockEvent = { type: 'unlock' };

        var euler = new THREE.Euler(0, 0, 0, 'YXZ');

        var PI_2 = Math.PI / 2;
        // var PI_2y = Math.PI / 3.8;
        var PI_2_mobile = Math.PI / 9;

        var vec = new THREE.Vector3();
        var clientX, clientY;
        var xfromtouch = 0;
        var yfromtouch = 0;
        let startPositionX = 0;
        let startPositionY = 0;

        function filterTouchEventByTarget(touchEvents, target) {
            const matchingKey = Object.keys(touchEvents)
                .find(key => touchEvents[key].target === target);

            return matchingKey && touchEvents[matchingKey];
        }

        function onTouch(e) {
            const touchEvent = filterTouchEventByTarget(e.touches, e.target);
            startPositionX = touchEvent.clientX;
            startPositionY = touchEvent.clientY;
        }

        function onTouchMove( e ) {
            const touchEvent = filterTouchEventByTarget(e.touches, e.target);
            clientY = touchEvent.clientY;
            clientX = touchEvent.clientX;
            xfromtouch = clientX - startPositionX;
            yfromtouch = clientY - startPositionY;
            euler.setFromQuaternion( camera.quaternion );
            euler.y -= xfromtouch * 0.001;
            euler.x -= yfromtouch * 0.001;
            euler.x = Math.max( - PI_2, Math.min( PI_2_mobile, euler.x ) );
            // euler.y = Math.max( - PI_2y, Math.min( PI_2y, euler.y ) );
            camera.quaternion.setFromEuler( euler );
            scope.dispatchEvent( changeEvent );
        };

        function onMouseMove(event) {

            if (scope.isLocked === false) return;

            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            euler.setFromQuaternion(camera.quaternion);

            euler.y -= movementX * 0.002;
            euler.x -= movementY * 0.002;

            euler.x = Math.max(- PI_2, Math.min(PI_2, euler.x));

            camera.quaternion.setFromEuler(euler);

            scope.dispatchEvent(changeEvent);

        }

        function onPointerlockChange() {
            if (isMobile) {
                if (scope.isLocked) {
                    scope.dispatchEvent(unlockEvent);
                    scope.isLocked = false;
                } else {
                    scope.dispatchEvent(lockEvent);
                    scope.isLocked = true;
                }
                return;
            }

            if (document.pointerLockElement === scope.domElement) {
                scope.dispatchEvent(lockEvent);
                scope.isLocked = true;
            } else {
                scope.dispatchEvent(unlockEvent);
                scope.isLocked = false;
            }
        }

        function onPointerlockError() {

            console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');

        }

        this.connect = function () {
            if (isMobile) {
                const viewControl = document.getElementById('view-controls');
                viewControl.addEventListener('touchstart', onTouch, false );
                viewControl.addEventListener('touchmove', onTouchMove, false);
                document.getElementById('exit-control').addEventListener(
                    'click',
                    onPointerlockChange,
                    false
                );
            } else {
                document.addEventListener('mousemove', onMouseMove, false);
                document.addEventListener('pointerlockchange', onPointerlockChange, false);
                document.addEventListener('pointerlockerror', onPointerlockError, false);
            }

        };

        this.disconnect = function () {
            if (isMobile) {
                const viewControl = document.getElementById('view-controls');
                viewControl.removeEventListener('touchstart', onTouch, false );
                viewControl.removeEventListener('touchmove', onTouchmove, false);
                document.getElementById('exit-control').removeEventListener(
                    'click',
                    onPointerlockChange,
                    false
                );
            } else {
                document.removeEventListener('mousemove', onMouseMove, false);
                document.removeEventListener('pointerlockchange', onPointerlockChange, false);
                document.removeEventListener('pointerlockerror', onPointerlockError, false);
            }
        };

        this.dispose = function () {

            this.disconnect();

        };

        this.getObject = function () { // retaining this method for backward compatibility

            return camera;

        };

        this.getDirection = function () {

            var direction = new THREE.Vector3(0, 0, - 1);

            return function (v) {

                return v.copy(direction).applyQuaternion(camera.quaternion);

            };

        }();

        this.moveForward = function (distance) {

            // move forward parallel to the xz-plane
            // assumes camera.up is y-up

            vec.setFromMatrixColumn(camera.matrix, 0);

            vec.crossVectors(camera.up, vec);

            camera.position.addScaledVector(vec, distance);

        };

        this.moveRight = function (distance) {

            vec.setFromMatrixColumn(camera.matrix, 0);

            camera.position.addScaledVector(vec, distance);

        };

        this.lock = function () {
            if (isMobile) {
                onPointerlockChange();
            } else {
                this.domElement.requestPointerLock();
            }
            this.connect();
        };

        this.unlock = function () {
            if (isMobile) {
                onPointerlockChange();
            } else {
                document.exitPointerLock();
            }
            this.disconnect();
        };

        // this.connect();
    };

    THREE.PointerLockControls.prototype = Object.create(THREE.EventDispatcher.prototype);
    THREE.PointerLockControls.prototype.constructor = THREE.PointerLockControls;

}