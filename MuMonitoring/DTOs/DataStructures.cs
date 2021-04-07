using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring.DTOs
{
    public class DataStructures
    {
    }

    public class P_Process
    {
        public Process process { get; set; }
        public DataProcessor data_processor { get; set; }
        public bool doMonitor { get; set; }
        public string alias { get; set; } 
    }
}
