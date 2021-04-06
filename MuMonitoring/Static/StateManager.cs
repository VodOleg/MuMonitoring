using MuMonitoring.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring.Static
{
    public static class StateManager
    {
        private static ClientConfigDTO m_config;
        private static Credentials m_creds;
        public static void Init(Credentials creds, ClientConfigDTO config)
        {
            // init
            m_creds = creds;
            m_config = config;
        }

        
    }
}
