using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.Rendering.Universal;

/// <summary>
/// Creates a test scene for LETAL with neon lighting and a basic runway.
/// Run from menu: ZonaTRunner > Create LETAL Test Scene
/// </summary>
public class LetalSceneSetup
{
    [MenuItem("ZonaTRunner/Create LETAL Test Scene")]
    public static void CreateTestScene()
    {
        // Create new scene
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

        // --- Ground plane (dark asphalt) ---
        var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
        ground.name = "Ground_Asphalt";
        ground.transform.localScale = new Vector3(5f, 1f, 50f);
        ground.transform.position = Vector3.zero;

        var groundMat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
        groundMat.SetColor("_BaseColor", new Color(0.04f, 0.03f, 0.06f, 1f));
        groundMat.SetFloat("_Smoothness", 0.7f);
        ground.GetComponent<Renderer>().material = groundMat;

        // --- 3 Lane markers (neon lines on the ground) ---
        float[] lanes = { -2f, 0f, 2f };
        Color[] laneColors = {
            new Color(1f, 0f, 0.33f, 1f),  // magenta
            new Color(0f, 1f, 1f, 1f),      // cyan
            new Color(0.8f, 0f, 1f, 1f)     // purple
        };

        for (int i = 0; i < 3; i++)
        {
            var lane = GameObject.CreatePrimitive(PrimitiveType.Cube);
            lane.name = $"Lane_Line_{i}";
            lane.transform.position = new Vector3(lanes[i], 0.01f, 25f);
            lane.transform.localScale = new Vector3(0.05f, 0.01f, 100f);

            var laneMat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            laneMat.EnableKeyword("_EMISSION");
            laneMat.SetColor("_BaseColor", laneColors[i]);
            laneMat.SetColor("_EmissionColor", laneColors[i] * 2f);
            lane.GetComponent<Renderer>().material = laneMat;
        }

        // --- Directional Light (moonlight) ---
        var sunObj = GameObject.Find("Directional Light");
        if (sunObj != null)
        {
            var sun = sunObj.GetComponent<Light>();
            sun.color = new Color(0.3f, 0.25f, 0.5f, 1f);
            sun.intensity = 0.3f;
            sun.transform.rotation = Quaternion.Euler(45f, -30f, 0f);
        }

        // --- Neon Point Lights ---
        CreateNeonLight("NeonLight_Purple_L", new Vector3(-4f, 3f, 10f), new Color(0.8f, 0f, 1f), 15f);
        CreateNeonLight("NeonLight_Magenta_R", new Vector3(4f, 3f, 10f), new Color(1f, 0f, 0.4f), 15f);
        CreateNeonLight("NeonLight_Cyan_Top", new Vector3(0f, 5f, 15f), new Color(0f, 1f, 1f), 10f);
        CreateNeonLight("NeonLight_Purple_Far", new Vector3(0f, 3f, 30f), new Color(0.6f, 0f, 1f), 20f);

        // --- Spawn point marker ---
        var spawn = new GameObject("LETAL_SpawnPoint");
        spawn.transform.position = new Vector3(0f, 0f, 0f);
        spawn.transform.rotation = Quaternion.identity;

        // --- Camera position (runner perspective) ---
        var cam = Camera.main;
        if (cam != null)
        {
            cam.transform.position = new Vector3(0f, 4.5f, -6f);
            cam.transform.rotation = Quaternion.Euler(25f, 0f, 0f);
            cam.backgroundColor = new Color(0.02f, 0.01f, 0.04f);
            cam.clearFlags = CameraClearFlags.SolidColor;
        }

        // Save the scene
        string scenePath = "Assets/_Project/Characters/LETAL/TestScene_LETAL.unity";
        EditorSceneManager.SaveScene(scene, scenePath);
        Debug.Log($"[LETAL] Test scene created at: {scenePath}");
    }

    private static void CreateNeonLight(string name, Vector3 pos, Color color, float range)
    {
        var go = new GameObject(name);
        go.transform.position = pos;
        var light = go.AddComponent<Light>();
        light.type = LightType.Point;
        light.color = color;
        light.intensity = 5f;
        light.range = range;
    }
}
