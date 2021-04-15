using MuMonitoring.DTOs;
using Newtonsoft.Json.Linq;
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
        public static List<ClientProcessDTO> data_to_send = new List<ClientProcessDTO>();
        public static void Init(Credentials creds, ClientConfigDTO config)
        {
            // init
            m_creds = creds;
            m_config = config;

        }

        public static void addData(P_Process process, SessionData data)
        {
            ClientProcessDTO newData = new ClientProcessDTO()
            {
                processID = process.process.Id,
                alias = process.alias,
                disconnected = data.disconnected,
                suspicious = data.suspicious,
                timestamp = data.timestamp
            };

            lock (data_to_send)
            {
                if (!data_to_send.Contains(newData) && process.doMonitor)
                {
                    //Log.Write($"add: {data}");
                    data_to_send.Add(newData);
                }
            }
        }

        public static List<ClientProcessDTO> getData()
        {
            List<ClientProcessDTO> toSend = data_to_send.ToList();
            data_to_send.Clear();
            return toSend;
        }
    }
}
