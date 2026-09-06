using UnityEngine;
using UnityEngine.SceneManagement;
namespace ZonaTRunner.Core {
    public class MenuLoader : MonoBehaviour {
        public void LoadGame() { 
            SceneManager.LoadScene("Gameplay"); 
        }
    }
}
