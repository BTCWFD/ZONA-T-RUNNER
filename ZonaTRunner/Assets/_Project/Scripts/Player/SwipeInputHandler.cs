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

        [Header("Swipe Tuning")]
        [SerializeField] private float minSwipeDistance = 50f; // pixels
        [SerializeField] private float maxSwipeTime = 0.5f; // seconds

        private Vector2 touchStartPosition;
        private float touchStartTime;
        private bool isTrackingSwipe = false;

        private void Update()
        {
            HandleKeyboardInput();
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
