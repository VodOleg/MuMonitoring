﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MuMonitoring.Static;
using MuMonitoring.DTOs;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Timers;
using MuMonitoring;
using System.Threading;

namespace ProcessMonitorUnitTest
{
    class MonitoringUnitTest
    {

        private int pid = 0;

        public MonitoringUnitTest(int singlePID)
        {
            pid = singlePID;
        }

        public ProcessMonitor m_pMonitor = null;
        private Dictionary<string, System.Timers.Timer> m_Timers;
        Dictionary<int, List<SessionData>>[] debugList = {
            new Dictionary<int, List<SessionData>>(),
            new Dictionary<int, List<SessionData>>()
        };
        private int rotationIndex = 0;
        private static readonly object rotationMutex = new object();

        private ClientConfigDTO loadJsonConfig(string configPath)
        {
            ClientConfigDTO clientConfig;
            if (File.Exists(configPath))
            {
                using (StreamReader r = new StreamReader(configPath))
                {
                    string jsonString = r.ReadToEnd();
                    dynamic json_ = JsonConvert.DeserializeObject<dynamic>(jsonString);
                    clientConfig = new ClientConfigDTO(json_?.ClientsConfig);
                    Console.WriteLine(jsonString);
                }
            }
            else
            {
                throw new Exception($"{configPath} does not exist, must supply config file.");
            }

            return clientConfig;
        }
        public void startTest(string configPath, string inputFile)
        {
            Credentials test_credentials = new Credentials("test");
            ClientConfigDTO config_test = loadJsonConfig(configPath);
            StateManager.Init(test_credentials,config_test);
            m_pMonitor = new ProcessMonitor();

            // if there is no input file it is data collection active run
            if (String.IsNullOrEmpty(inputFile))
            {
                //data collection
                Console.WriteLine("Running in data collection mode");
                run();
            }
            else
            {
                // data analyzer
                Console.WriteLine($"Running in data analyze mode, on file {inputFile}");
                analyze(inputFile);
            }
            
        }

        private void run()
        {
            //init timers list
            m_Timers = new Dictionary<string, System.Timers.Timer>();
            m_pMonitor.publishActiveProcesses();
            m_pMonitor.run();
            
            m_Timers["DataAnalyzer"] = new System.Timers.Timer(StateManager.m_config.pollingIntervalMS);
            m_Timers["DataAnalyzer"].Elapsed += (Object source, ElapsedEventArgs e) => {
                lock (rotationMutex)
                {
                    Console.WriteLine($"Filling up debugList[{rotationIndex}]");
                    this.m_pMonitor.analyzeData(debugList[rotationIndex]);
                }
            };

            m_Timers["DumpToFiles"] = new System.Timers.Timer(StateManager.m_config.KeepAliveTimeSec * 1000);
            m_Timers["DumpToFiles"].Elapsed += (Object source, ElapsedEventArgs e) => {
                int indexToSend = rotationIndex;
                lock (rotationMutex)
                {
                    rotationIndex = (rotationIndex + 1) % 2;
                }
                dumpData(indexToSend);
                debugList[indexToSend].Clear();
            };

            foreach( var timer in m_Timers)
            {
                timer.Value.Start();
            }

            while (true)
            {
                Thread.Sleep(10000);
            }
        }


        private void dumpData(int indexToDump)
        {
            //Console.Clear();
            Console.WriteLine("----------------------------------------------");
            Console.WriteLine($"list[{indexToDump}].Count = {debugList[indexToDump].Count}");
            foreach (var item in debugList[indexToDump])
            {
                if(pid!=0 && item.Key != pid) {
                    continue;
                }

                //SessionData sessionData = (SessionData)(item.Value[typeof(SessionData)]);
                string fileDumpName = $"output/{item.Key}_.csv";

                string dataMessage = "";
                bool isSuspivious = false;
                string reason_ = "";
                Directory.CreateDirectory("output");

                if (!File.Exists(fileDumpName))
                {
                    dataMessage += "Time,Received,Suspicius,Disconnected\n";
                }
                foreach(var sessionData in item.Value)
                {
                    dataMessage += $"{sessionData.timestamp.ToString()},{sessionData.received},{sessionData.suspicious},{sessionData.disconnected}\n";
                    
                    if (sessionData.suspicious)
                    {
                        isSuspivious = true;
                        reason_ += sessionData.reason + ", ";
                    }
                }
                Console.WriteLine($"[{item.Key}: {item.Value.Count}] suspicious={isSuspivious} ({reason_})");

                using (FileStream sourceStream = new FileStream(fileDumpName,
                FileMode.Append, FileAccess.Write, FileShare.None,
                bufferSize: 4096, useAsync: true))
                {
                    using (StreamWriter sw = new StreamWriter(sourceStream))
                    {
                        //writes async
                        //sw.WriteLineAsync(dataMessage).Wait();
                        sw.Write(dataMessage);
                    }
                };
            }
        }

        private void analyze(string filePath)
        {
            throw new Exception("analyze not implemented");
        }
    }


}
