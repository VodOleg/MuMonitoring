using System;
using System.Diagnostics;

namespace MuMonitoring.DTOs
{
    public class DataStructures
    {
    }

    public class P_Process:IDisposable
    {
        public Process process { get; set; }
        public DataProcessor data_processor { get; set; }
        public bool doMonitor { get; set; }
        public string alias { get; set; } 
        public bool disconnected { get; set; }
        public bool suspicious { get; set; }
        public DateTime monitorStartTime { get; set; }

        public void Dispose()
        {
            this.process = null;
            this.data_processor = null;
        }
    }
}
