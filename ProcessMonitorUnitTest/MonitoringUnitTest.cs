using System;
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
        public ProcessMonitor m_pMonitor = null;
        private Dictionary<string, System.Timers.Timer> m_Timers;
        Dictionary<int, Dictionary<Type, Object>>[] debugList = {
            new Dictionary<int, Dictionary<Type, object>>(),
            new Dictionary<int, Dictionary<Type, object>>()
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
            Console.WriteLine($"dumping[{indexToDump}] length={debugList[indexToDump].Count} other count={debugList[rotationIndex].Count} , indexToDump={indexToDump} , rotation={rotationIndex}");
            foreach (var item in debugList[indexToDump])
            {
                SessionData sessionData = (SessionData)(item.Value[typeof(SessionData)]);
                ClientProcessDTO clientProcess = (ClientProcessDTO)(item.Value[typeof(ClientProcessDTO)]);
                string fileDumpName = $"output/{clientProcess.processID}_.csv";

                string dataMessage = "";

                Directory.CreateDirectory("output");

                if (!File.Exists(fileDumpName))
                {
                    dataMessage += "Time,Received,Suspicius,Disconnected\n";
                }

                dataMessage += $"{sessionData.timestamp.ToString()},{sessionData.received},{clientProcess.suspicious},{clientProcess.disconnected}";
                using (FileStream sourceStream = new FileStream(fileDumpName,
                FileMode.Append, FileAccess.Write, FileShare.None,
                bufferSize: 4096, useAsync: true))
                {
                    using (StreamWriter sw = new StreamWriter(sourceStream))
                    {
                        //writes async
                        //sw.WriteLineAsync(dataMessage).Wait();
                        sw.WriteLine(dataMessage);
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
