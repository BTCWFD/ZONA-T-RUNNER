using UnityEngine;
namespace ZonaTRunner.Core {
    public class CameraFollow : MonoBehaviour {
        public Transform target;
        public Vector3 offset = new Vector3(0, 4.5f, -6f);
        void LateUpdate() {
            if (target == null) {
                GameObject p = GameObject.FindGameObjectWithTag("Player");
                if(p != null) target = p.transform;
            }
            if (target != null) {
                transform.position = target.position + offset;
            }
        }
    }
}
