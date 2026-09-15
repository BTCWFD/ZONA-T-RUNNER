using System;
using UnityEngine;

namespace ZonaTRunner.Player
{
    public class SwipeInputHandler : MonoBehaviour
    {
        public static event Action OnSwipeLeft;
        public static event Action OnSwipeRight;
        public static event Action OnSwipeUp;
        public static event Action OnSwipeDown;
        public static event Action OnPause;

        [Header("Gamepad (PC)")]
        [Tooltip("Zona muerta del stick. Por debajo de este valor no se dispara nada.")]
        [SerializeField] private float stickDeadzone = 0.55f;

        // La Gamepad API no emite eventos: hay que comparar contra el frame anterior
        // para disparar solo en el flanco de subida y no una accion por frame.
        private bool padLeftHeld, padRightHeld, padUpHeld, padDownHeld;
        private bool gamepadConnected;
        private float nextGamepadCheck;

        [Header("Swipe Tuning")]
        [SerializeField] private float minSwipeDistance = 50f; // pixels
        [SerializeField] private float maxSwipeTime = 0.5f; // seconds

        private Vector2 touchStartPosition;
        private float touchStartTime;
        private bool isTrackingSwipe = false;

        private void Update()
        {
            HandleKeyboardInput();
            HandleGamepadInput();
            HandleTouchInput();
        }

        private void HandleKeyboardInput()
        {
            if (Input.GetKeyDown(KeyCode.LeftArrow) || Input.GetKeyDown(KeyCode.A))
                OnSwipeLeft?.Invoke();
            else if (Input.GetKeyDown(KeyCode.RightArrow) || Input.GetKeyDown(KeyCode.D))
                OnSwipeRight?.Invoke();
            else if (Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.Space))
                OnSwipeUp?.Invoke();
            else if (Input.GetKeyDown(KeyCode.DownArrow) || Input.GetKeyDown(KeyCode.S))
                OnSwipeDown?.Invoke();
            else if (Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.P))
                OnPause?.Invoke();
        }

        /// <summary>
        /// Mando en PC. Layout estandar: A/Cross salta, B/Circle desliza,
        /// D-pad y stick izquierdo cambian de carril, Start pausa.
        /// Ver docs/PLATAFORMAS_Y_CONTROLES.md.
        /// </summary>
        private void HandleGamepadInput()
        {
            if (!IsGamepadConnected()) return;

            // Los ejes "Horizontal"/"Vertical" del Input Manager tambien los alimenta
            // el teclado, y HandleKeyboardInput ya cubre ese caso. Sin descontarlo,
            // una flecha dispararia la accion dos veces en el mismo frame.
            bool kbLeft  = Input.GetKey(KeyCode.LeftArrow)  || Input.GetKey(KeyCode.A);
            bool kbRight = Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D);
            bool kbUp    = Input.GetKey(KeyCode.UpArrow)    || Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.Space);
            bool kbDown  = Input.GetKey(KeyCode.DownArrow)  || Input.GetKey(KeyCode.S);

            float h = Input.GetAxisRaw("Horizontal");
            float v = Input.GetAxisRaw("Vertical");

            bool left  = h < -stickDeadzone && !kbLeft;
            bool right = h >  stickDeadzone && !kbRight;
            bool up    = (v >  stickDeadzone && !kbUp)   || Input.GetKeyDown(KeyCode.JoystickButton0);
            bool down  = (v < -stickDeadzone && !kbDown) || Input.GetKeyDown(KeyCode.JoystickButton1);

            if (left  && !padLeftHeld)  OnSwipeLeft?.Invoke();
            if (right && !padRightHeld) OnSwipeRight?.Invoke();
            if (up    && !padUpHeld)    OnSwipeUp?.Invoke();
            if (down  && !padDownHeld)  OnSwipeDown?.Invoke();

            padLeftHeld = left;
            padRightHeld = right;
            padUpHeld = up;
            padDownHeld = down;

            if (Input.GetKeyDown(KeyCode.JoystickButton7) || Input.GetKeyDown(KeyCode.JoystickButton6))
                OnPause?.Invoke();
        }

        /// <summary>Sondea la lista de mandos cada medio segundo; consultarla cada frame asigna memoria.</summary>
        private bool IsGamepadConnected()
        {
            if (Time.unscaledTime >= nextGamepadCheck)
            {
                nextGamepadCheck = Time.unscaledTime + 0.5f;
                gamepadConnected = false;
                foreach (string name in Input.GetJoystickNames())
                {
                    if (!string.IsNullOrEmpty(name)) { gamepadConnected = true; break; }
                }
            }
            return gamepadConnected;
        }

        private void HandleTouchInput()
        {
            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);

                switch (touch.phase)
                {
                    case TouchPhase.Began:
                        touchStartPosition = touch.position;
                        touchStartTime = Time.time;
                        isTrackingSwipe = true;
                        break;

                    case TouchPhase.Ended:
                        if (!isTrackingSwipe) return;
                        isTrackingSwipe = false;

                        float swipeDuration = Time.time - touchStartTime;
                        Vector2 swipeDelta = touch.position - touchStartPosition;

                        if (swipeDuration <= maxSwipeTime && swipeDelta.magnitude >= minSwipeDistance)
                        {
                            DetectSwipeDirection(swipeDelta);
                        }
                        break;

                    case TouchPhase.Canceled:
                        isTrackingSwipe = false;
                        break;
                }
            }
            // Fallback for mouse click/drag in Unity Editor
            #if UNITY_EDITOR
            else
            {
                if (Input.GetMouseButtonDown(0))
                {
                    touchStartPosition = Input.mousePosition;
                    touchStartTime = Time.time;
                    isTrackingSwipe = true;
                }
                else if (Input.GetMouseButtonUp(0) && isTrackingSwipe)
                {
                    isTrackingSwipe = false;
                    float swipeDuration = Time.time - touchStartTime;
                    Vector2 swipeDelta = (Vector2)Input.mousePosition - touchStartPosition;

                    if (swipeDuration <= maxSwipeTime && swipeDelta.magnitude >= minSwipeDistance)
                    {
                        DetectSwipeDirection(swipeDelta);
                    }
                }
            }
            #endif
        }

        private void DetectSwipeDirection(Vector2 delta)
        {
            if (Mathf.Abs(delta.x) > Mathf.Abs(delta.y))
            {
                if (delta.x > 0) OnSwipeRight?.Invoke();
                else OnSwipeLeft?.Invoke();
            }
            else
            {
                if (delta.y > 0) OnSwipeUp?.Invoke();
                else OnSwipeDown?.Invoke();
            }
        }
    }
}
