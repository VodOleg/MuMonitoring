using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring.DTOs
{
    public class ClientConfigDTO
    {
        public string ProcessName { get; set; }
        public int rotationNotifyTimeMS { get; set; }
        public int pollingIntervalMS { get; set; }
        public int SequentialBadBehaviourFrameSize { get; set; }
        public int AnalysisWindowSize { get; set; }
        public int ClientRefreshTimeSec { get; set; }
        public int KeepAliveTimeSec { get; set; }
        public ClientConfigDTO() { }

        public ClientConfigDTO(dynamic config) 
        {
            ProcessName = (string)config.ProcessName;
            rotationNotifyTimeMS = (int)config.rotationNotifyTimeMS;
            pollingIntervalMS = (int)config.pollingIntervalMS;
            SequentialBadBehaviourFrameSize = (int)config.SequentialBadBehaviourFrameSize;
            AnalysisWindowSize = (int)config.AnalysisWindowSize;
            ClientRefreshTimeSec = (int)config.ClientRefreshTimeSec;
            KeepAliveTimeSec = (int)config.KeepAliveTimeSec;
        }
    }
}
