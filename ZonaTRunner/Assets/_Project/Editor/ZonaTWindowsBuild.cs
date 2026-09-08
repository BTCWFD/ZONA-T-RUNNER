using UnityEngine;
using UnityEditor;
using UnityEditor.Build.Reporting;

public class ZonaTWindowsBuild
{
    [MenuItem("ZonaTRunner/Build Windows Executable")]
    public static void BuildStandalone()
    {
        string[] scenes = new string[]
        {
            "Assets/_Project/Scenes/ZonaT_Playable_Scene.unity"
        };

        string buildPath = @"C:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\Builds\Windows\ZonaTRunner.exe";

        BuildPlayerOptions buildOptions = new BuildPlayerOptions();
        buildOptions.scenes = scenes;
        buildOptions.locationPathName = buildPath;
        buildOptions.target = BuildTarget.StandaloneWindows64;
        buildOptions.options = BuildOptions.None;

        BuildReport report = BuildPipeline.BuildPlayer(buildOptions);
        BuildSummary summary = report.summary;

        if (summary.result == BuildResult.Succeeded)
        {
            Debug.Log($"=== WINDOWS STANDALONE BUILD SUCCEEDED! Output: {buildPath} ({summary.totalSize / (1024 * 1024)} MB) ===");
        }
        else
        {
            Debug.LogError($"=== BUILD FAILED: {summary.result} with {summary.totalErrors} errors ===");
        }
    }
}
