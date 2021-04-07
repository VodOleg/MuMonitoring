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
    }
}
