﻿using MuMonitoring.DTOs;
using MuMonitoring.Static;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring
{
    static class BackendCom
    { 
        private static string BackendURL = "http://127.0.0.1:3000";

        private static HttpClient m_client;

        // API strings 
        private static string m_Const_startSession = "/StartSession";
        private static string m_Const_updateSession = "/UpdateSession";
        private static System.Threading.Mutex oSingleInstance;
        
        
        public static bool isConnected()
        {
            return m_client != null;
        }

        public static bool Init()
        {
            Log.Write("Initializing App");
            bool ok;
            oSingleInstance = new System.Threading.Mutex(true, "MuMonitor_", out ok);

            if (!ok)
            {
                // Another instance is already running. Exit
                System.Windows.MessageBox.Show("Another instance of MuMonitor already running.", "MuMonitor");
                System.Windows.Application.Current.Shutdown();
            }

            // Get current version
            

            if (isConnected())
            {
                return true;
            }
            string userName = System.Security.Principal.WindowsIdentity.GetCurrent().Name;
            if (!userName.ToLower().Contains("ovod"))
            {
                BackendURL = "http://10.88.253.44:3000";
            }

            m_client = new HttpClient();

            return true;
        }

        private static async Task<string> sendPost(string url_, StringContent content)
        {
            string resString = null;
            try
            {
                var res = m_client.PostAsync(url_, content).Result;
                resString = await res.Content.ReadAsStringAsync();
            }catch(Exception exc)
            {
                Log.Write($"Exception occured at sendPost: {exc}");
                Log.Write($"{exc.StackTrace}");
            }
            return resString;
        }

        private static void validateVersion(Version newestVersion)
        {
            Version currentVersion = new Version(MainWindow.m_sCurrentVersion);
            if ( currentVersion < newestVersion)
            {
                Utils.NotifyUser("New Version Is Availble");
            }
        }

        public static string Authenticate(Credentials credentials)
        {
            JObject o = new JObject();
            string res_= "Failed creating session: ";
            try
            {
                o["username"] = credentials.username;
                var httpContent = new StringContent(o.ToString(), Encoding.UTF8, "application/json");
                string res = sendPost(BackendURL+m_Const_startSession, httpContent).Result;
                dynamic response = null;
                if (res != null) { 
                    response = JsonConvert.DeserializeObject(res);
                };
                if (response != null && (bool)response.success)
                {
                    // call 
                    credentials.sessionKey = (string)response.data.SessionKey;
                    ClientConfigDTO config = new ClientConfigDTO(response.data.ClientConfig);
                    validateVersion(config.NewestClientVersion);
                    StateManager.Init(credentials, config);
                    res_ = "";
                }
                else if ( response != null)
                {
                    res_ += response.message;
                }
                else
                {
                    res_ += "Failed connecting to server";
                }
            }
            catch(Exception exc)
            {
                res_ += "Exception occured.";
                Log.Write("Error occured when trying to authenticate \n "+exc.Message);
                Log.Write(exc.StackTrace);
            }


            return res_;
        }

        public static async Task<bool> sendDataToBE()
        {
            try
            {
                dataMessageDTO msg = new dataMessageDTO();
                msg.creds = StateManager.m_creds;
                msg.clients = StateManager.getData();
                string seriliazed = JsonConvert.SerializeObject(msg);
                var httpContent = new StringContent(seriliazed, Encoding.UTF8, "application/json");

                sendPost(BackendURL + m_Const_updateSession, httpContent);
            }catch(Exception exc)
            {
                Log.Write($"Exception occured when sending data");
                Log.Write($"{ exc.Message} \n {exc.StackTrace}");
            }
            return true;
        }
    }
}
