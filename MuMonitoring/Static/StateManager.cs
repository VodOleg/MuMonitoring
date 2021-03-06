using MuMonitoring.DTOs;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace MuMonitoring.Static
{
    public static class StateManager
    {
        public static ClientConfigDTO m_config;
        public static Credentials m_creds;
        public static readonly object monitoredProcessesMutex = new object();
        public static List<P_Process> monitored_processes = new List<P_Process>();
        public static Dictionary<int, List<ClientProcessDTO>>[] data_to_send = { new Dictionary<int, List<ClientProcessDTO>>(), new Dictionary<int, List<ClientProcessDTO>>() };
        private static int rotationIndex = 0;
        private static readonly object rotatioMutex = new object();
        public static void Init(Credentials creds, ClientConfigDTO config)
        {
            // init
            m_creds = creds;
            m_config = config;
        }

        public static void addData(ClientProcessDTO newData)
        {
            
            lock (rotatioMutex)
            {
                if (!(data_to_send[rotationIndex]).ContainsKey(newData.processID))
                {
                    (data_to_send[rotationIndex])[newData.processID] = new List<ClientProcessDTO>();
                }

                (data_to_send[rotationIndex])[newData.processID].Add(newData);
            }
            
        }

        public static string getSerializedData()
        {
            int indexToSend = rotationIndex;
            lock (rotatioMutex)
            {
                rotationIndex = (rotationIndex + 1) % 2;
            }

            dataMessageDTO msg = new dataMessageDTO();
            msg.creds = m_creds;
            msg.clients = data_to_send[indexToSend];
            string ret = JsonConvert.SerializeObject(msg);
            data_to_send[indexToSend].Clear();
            return ret;
        }
    }
}
