using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace ZonaTRunner.EditorTools
{
    /// <summary>
    /// Copia el contenido canonico de data/ (raiz del repo) a StreamingAssets.
    ///
    /// data/ es la fuente unica de verdad y la comparten Unity y el web-runner.
    /// StreamingAssets es una copia generada: esta en .gitignore y se regenera
    /// automaticamente antes de cada build, ademas del menu ZonaT.
    /// </summary>
    public class ContentSync : IPreprocessBuildWithReport
    {
        public int callbackOrder => 0;

        private static readonly string[] Files =
        {
            "djs/roster.json",
            "djs/dj_schema.json",
        };

        /// <summary>Raiz del repo: dos niveles arriba de Assets/ (ZonaTRunner/Assets -> ZonaTRunner -> repo).</summary>
        private static string RepoRoot =>
            Path.GetFullPath(Path.Combine(Application.dataPath, "..", ".."));

        private static string SourceDir => Path.Combine(RepoRoot, "data");
        private static string TargetDir => Path.Combine(Application.streamingAssetsPath, "data");

        [MenuItem("ZonaT/Sincronizar contenido (data -> StreamingAssets)")]
        public static void Sync()
        {
            if (!Directory.Exists(SourceDir))
            {
                Debug.LogError($"[ZonaT] No se encontro data/ en {SourceDir}. " +
                               "El proyecto de Unity debe vivir dentro del repo.");
                return;
            }

            int copied = 0;
            foreach (string rel in Files)
            {
                string src = Path.Combine(SourceDir, rel);
                if (!File.Exists(src))
                {
                    Debug.LogWarning($"[ZonaT] Falta {rel} en data/. Se omite.");
                    continue;
                }
                string dst = Path.Combine(TargetDir, rel);
                Directory.CreateDirectory(Path.GetDirectoryName(dst));
                File.Copy(src, dst, overwrite: true);
                copied++;
            }

            AssetDatabase.Refresh();
            Debug.Log($"[ZonaT] Contenido sincronizado: {copied}/{Files.Length} archivos en StreamingAssets.");
        }

        public void OnPreprocessBuild(BuildReport report) => Sync();
    }
}
