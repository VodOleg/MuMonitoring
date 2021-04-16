using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
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

        public static BackgroundWorker startBWThread(DoWorkEventHandler cb)
        {
            BackgroundWorker bw_ = new BackgroundWorker();
            bw_.DoWork += cb;
            bw_.RunWorkerAsync();
            return bw_;
        }

        private static void logMessageToWindow(object sender, EventArgs e)
        {
            if (newLogMessage != null)
            {
                newLogMessage(sender, e);
            }
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
    }
}
