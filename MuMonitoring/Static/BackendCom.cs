using MuMonitoring.DTOs;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring
{
    static class BackendCom
    { 
        private static string BackendURL = "http://127.0.0.1:3000";
        private static HttpClient m_client;

        public static bool isConnected()
        {
            return m_client != null;
        }

        public static bool Init()
        {
            if (isConnected())
            {
                return true;
            }

            m_client = new HttpClient();

            return true;
        }

        private static string BuildMessage(string type, string message)
        {
            
            return "";
        }


        public static bool Authenticate(Credentials credentials)
        {
            JObject o = new JObject();

            o["username"] = credentials.username;
            o["op"] = "FirstAuth";
            var httpContent = new StringContent(o.ToString(), Encoding.UTF8, "application/json");
            m_client.PostAsync(BackendURL, httpContent);

            return true;
        }
    }
}
