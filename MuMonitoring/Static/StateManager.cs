using MuMonitoring.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static MuMonitoring.Static.ProcessMonitor;

namespace MuMonitoring.Static
{
    public static class StateManager
    {
        public static ClientConfigDTO m_config;
        public static Credentials m_creds;
        public static readonly object monitoredProcessesMutex = new object();
        public static List<P_Process> monitored_processes = new List<P_Process>();

        public static void Init(Credentials creds, ClientConfigDTO config)
        {
            // init
            m_creds = creds;
            m_config = config;
        }

        public static string getProcessName()
        {
            return m_config.ProcessName;
        }

        
    }
}
