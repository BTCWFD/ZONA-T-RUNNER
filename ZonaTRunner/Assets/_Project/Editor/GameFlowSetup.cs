using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using ZonaTRunner.Core;
using ZonaTRunner.World;

public class GameFlowSetup
{
    [MenuItem("ZonaTRunner/Setup Game Flow (Menu and Gameplay)")]
    public static void BuildFlow()
    {
        EnsurePlayerTag();
        CreateTrackPrefab();
        
        string gameplayPath = "Assets/_Project/Gameplay.unity";
        Scene gameplayScene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        SetupGameplayScene();
        EditorSceneManager.SaveScene(gameplayScene, gameplayPath);
        
        string menuPath = "Assets/_Project/MainMenu.unity";
        Scene menuScene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        SetupMainMenuScene();
        EditorSceneManager.SaveScene(menuScene, menuPath);
        
        EditorBuildSettings.scenes = new EditorBuildSettingsScene[]
        {
            new EditorBuildSettingsScene(menuPath, true),
            new EditorBuildSettingsScene(gameplayPath, true)
        };
        
        Debug.Log("[GAME FLOW] Setup complete! MainMenu and Gameplay created.");
    }

    private static void EnsurePlayerTag()
    {
        SerializedObject tagManager = new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/TagManager.asset")[0]);
        SerializedProperty tagsProp = tagManager.FindProperty("tags");
        bool found = false;
        for (int i = 0; i < tagsProp.arraySize; i++) {
            if (tagsProp.GetArrayElementAtIndex(i).stringValue == "Player") { found = true; break; }
        }
        if (!found) {
            tagsProp.InsertArrayElementAtIndex(0);
            tagsProp.GetArrayElementAtIndex(0).stringValue = "Player";
            tagManager.ApplyModifiedProperties();
        }
    }

    private static void CreateTrackPrefab()
    {
        string path = "Assets/_Project/Prefabs/BasicTrackSegment.prefab";
        if (!AssetDatabase.IsValidFolder("Assets/_Project/Prefabs")) AssetDatabase.CreateFolder("Assets/_Project", "Prefabs");
        if (System.IO.File.Exists(path)) return;

        GameObject trackRoot = new GameObject("TrackSegment");
        GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Cube);
        floor.transform.SetParent(trackRoot.transform);
        floor.transform.localScale = new Vector3(10f, 0.5f, 30f);
        floor.transform.localPosition = new Vector3(0, -0.25f, 15f);

        Material mat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
        mat.SetColor("_BaseColor", new Color(0.1f, 0.1f, 0.15f));
        floor.GetComponent<Renderer>().sharedMaterial = mat;

        PrefabUtility.SaveAsPrefabAsset(trackRoot, path);
        Object.DestroyImmediate(trackRoot);
    }

    private static void SetupGameplayScene()
    {
        GameObject gmObj = new GameObject("GameManager");
        gmObj.AddComponent<GameManager>();

        GameObject playerPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/_Project/Characters/LETAL/Prefabs/LETAL_Character.prefab");
        GameObject playerObj = null;
        if (playerPrefab != null) {
            playerObj = (GameObject)PrefabUtility.InstantiatePrefab(playerPrefab);
            playerObj.transform.position = new Vector3(0, 0, 0);
            playerObj.tag = "Player";
        }

        Camera cam = Camera.main;
        if (cam != null) {
            cam.gameObject.AddComponent<ZonaTRunner.World.CameraFollow>();
        }

        GameObject spawnerObj = new GameObject("TrackSpawner");
        TrackSpawner spawner = spawnerObj.AddComponent<TrackSpawner>();
        SerializedObject so = new SerializedObject(spawner);
        SerializedProperty prop = so.FindProperty("trackSegmentPrefabs");
        prop.arraySize = 1;
        prop.GetArrayElementAtIndex(0).objectReferenceValue = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/_Project/Prefabs/BasicTrackSegment.prefab");
        so.ApplyModifiedProperties();
        
        GameObject light = GameObject.Find("Directional Light");
        if (light != null) light.GetComponent<Light>().color = new Color(0.3f, 0f, 0.5f);
    }

    private static void SetupMainMenuScene()
    {
        GameObject canvasObj = new GameObject("Canvas");
        Canvas canvas = canvasObj.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        canvasObj.AddComponent<CanvasScaler>();
        canvasObj.AddComponent<GraphicRaycaster>();
        canvasObj.AddComponent<ZonaTRunner.Core.MenuLoader>();

        GameObject bgObj = new GameObject("Background");
        bgObj.transform.SetParent(canvasObj.transform, false);
        Image bg = bgObj.AddComponent<Image>();
        bg.color = new Color(0.05f, 0.05f, 0.1f);
        RectTransform bgRT = bgObj.GetComponent<RectTransform>();
        bgRT.anchorMin = Vector2.zero; bgRT.anchorMax = Vector2.one; bgRT.sizeDelta = Vector2.zero;

        GameObject btnObj = new GameObject("PlayButton");
        btnObj.transform.SetParent(canvasObj.transform, false);
        Image btnImg = btnObj.AddComponent<Image>();
        btnImg.color = new Color(0.8f, 0f, 1f);
        Button btn = btnObj.AddComponent<Button>();
        RectTransform btnRT = btnObj.GetComponent<RectTransform>();
        btnRT.sizeDelta = new Vector2(300, 80); btnRT.anchoredPosition = new Vector2(0, -50);

        UnityEditor.Events.UnityEventTools.AddPersistentListener(btn.onClick, canvasObj.GetComponent<ZonaTRunner.Core.MenuLoader>().LoadGame);

        GameObject textObj = new GameObject("Text");
        textObj.transform.SetParent(btnObj.transform, false);
        Text txt = textObj.AddComponent<Text>();
        txt.text = "JUGAR CON LETAL";
        txt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        txt.fontSize = 24; txt.alignment = TextAnchor.MiddleCenter; txt.color = Color.white;
        RectTransform txtRT = textObj.GetComponent<RectTransform>();
        txtRT.anchorMin = Vector2.zero; txtRT.anchorMax = Vector2.one; txtRT.sizeDelta = Vector2.zero;

        GameObject titleObj = new GameObject("Title");
        titleObj.transform.SetParent(canvasObj.transform, false);
        Text titleTxt = titleObj.AddComponent<Text>();
        titleTxt.text = "ZONA T RUNNER";
        titleTxt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        titleTxt.fontSize = 50; titleTxt.alignment = TextAnchor.MiddleCenter; titleTxt.color = Color.cyan;
        RectTransform titleRT = titleObj.GetComponent<RectTransform>();
        titleRT.sizeDelta = new Vector2(500, 100); titleRT.anchoredPosition = new Vector2(0, 150);

        GameObject esObj = new GameObject("EventSystem");
        esObj.AddComponent<UnityEngine.EventSystems.EventSystem>();
        esObj.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
    }
}
