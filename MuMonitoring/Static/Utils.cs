using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Tasks;

namespace MuMonitoring.Static
{
    public static class Utils
    {
        public static event EventHandler newLogMessage;
        public static async Task SetInterval(Action action, TimeSpan timeout)
        {
            await Task.Delay(timeout).ConfigureAwait(false);

            action();

            SetInterval(action, timeout);
        }

        private static void logMessageToWindow(object sender, EventArgs e)
        {
            if (newLogMessage != null)
            {
                newLogMessage(sender, e);
            }
        }

        public static long measureObjSize(object o)
        {
            long size = 0;
            using (Stream s = new MemoryStream())
            {
                BinaryFormatter formatter = new BinaryFormatter();
                formatter.Serialize(s, o);
                size = s.Length;
            }
            return size;
        }

        public static void NotifyUser(string message)
        {
            if (!string.IsNullOrEmpty(message))
            {
                string msg = $"{DateTime.Now.ToString("HH:mm")}->{message}";
                MainWindow.m_logList.Add(msg);
                logMessageToWindow(null, null);
            }
        }
        public static Dictionary<string, string> g_config = null;
        public static Dictionary<string, string> getLocalConfig()
        {
            const string local_file_name = "local.cfg";
            if (!File.Exists(local_file_name))
            {
                return null;
            }
            
            if (g_config == null)
            {
                g_config = new Dictionary<string, string>();
            }

            foreach (string line in File.ReadLines(local_file_name))
            {
                if (line.Contains("="))
                {
                    string[] words = line.Split('=');
                    if(words.Length == 2)
                    {
                        g_config[words[0]] = words[1];
                    }
                }
            }

            return g_config;
        }
    }
}
