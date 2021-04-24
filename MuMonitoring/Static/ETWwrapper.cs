using Microsoft.Diagnostics.Tracing.Parsers;
using Microsoft.Diagnostics.Tracing.Session;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MuMonitoring
{
    
    public static class ETWwrapper
    {
        private static Task m_workingThread;
        private static CancellationTokenSource _tokenSource = null;
        private static Dictionary<int, List<SessionData>>[] m_ProcessIDs = { 
            new Dictionary<int, List<SessionData>>() ,
            new Dictionary<int, List<SessionData>>()
        };
        private static int rotationIndex = 0;
        private static readonly object rotationMutex = new object();
        private static TraceEventSession m_EtwSession;

        public static void start()
        {
            _tokenSource = new CancellationTokenSource();
            var cancelToken = _tokenSource.Token;
            m_workingThread = Task.Run(() => StartEtwSession(cancelToken));
        }

        public static void addProcess(int processID)
        {
            lock (m_ProcessIDs)
            {
                foreach(var dic_ in m_ProcessIDs)
                {
                    dic_[processID] = new List<SessionData>();
                }

                //m_ProcessIDs[processID][0] = new List<SessionData>();// SessionData();
                //m_ProcessIDs[processID][1] = new List<SessionData>();// SessionData();
            }
        }

        public static void removeProcess(int processID)
        {
            lock (m_ProcessIDs)
            {
                foreach(var dic_ in m_ProcessIDs)
                {
                    dic_[processID].Clear();
                    dic_.Remove(processID);
                }
                //m_ProcessIDs[0][processID].Clear();
                //m_ProcessIDs[1][processID].Clear();
                //m_ProcessIDs[0].Remove(processID);
                //m_ProcessIDs[1].Remove(processID);
            }
        }

        public static void resetAll()
        {
            lock (m_ProcessIDs)
            {
                foreach(var listOfData in m_ProcessIDs)
                {
                    listOfData.Clear();
                    //process_.Value.disconnected = false;
                    //process_.Value.suspicious = false;
                }

            }
        }

        private static void StartEtwSession(CancellationToken cancelToken)
        {
            try
            {

                using (m_EtwSession = new TraceEventSession("MyKernelAndClrEventsSession"))
                {
                    m_EtwSession.EnableKernelProvider(KernelTraceEventParser.Keywords.NetworkTCPIP);

                    m_EtwSession.Source.Kernel.TcpIpRecv += data =>
                    {
                        //Console.WriteLine($"process reading: {data.ProcessID}");
                        if (cancelToken.IsCancellationRequested)
                        {
                            // stop the monitor
                            //Console.WriteLine("canceled rec");
                            return;
                        }
                        lock (rotationMutex)
                        {

                            if (m_ProcessIDs[rotationIndex].ContainsKey(data.ProcessID))
                            {
                                //Console.WriteLine($"rec: {data.ProcessID} ({data.TimeStamp}) ->{data.size}");
                                lock (m_ProcessIDs[rotationIndex][data.ProcessID])
                                {
                                    SessionData new_data = new SessionData();
                                    new_data.disconnected = false;
                                    new_data.received = data.size;
                                    new_data.timestamp = data.TimeStamp;
                                    m_ProcessIDs[rotationIndex][data.ProcessID].Add(new_data);
                                    //m_ProcessIDs[data.ProcessID].received = data.size;
                                    //m_ProcessIDs[data.ProcessID].timestamp = data.TimeStamp;
                                }

                            }
                        }
                    };
                    m_EtwSession.Source.Kernel.TcpIpConnect += data =>
                    {
                        if (cancelToken.IsCancellationRequested)
                        {
                            return;
                        }
                        lock (rotationMutex)
                        {

                            if (m_ProcessIDs[rotationIndex].ContainsKey(data.ProcessID))
                            {
                                lock (m_ProcessIDs[rotationIndex][data.ProcessID])
                                {
                                    SessionData new_data = new SessionData();
                                    new_data.disconnected = false;
                                    new_data.received = data.size;
                                    new_data.timestamp = data.TimeStamp;
                                    m_ProcessIDs[rotationIndex][data.ProcessID].Add(new_data);
                                }
                            }
                        }
                    };

                    m_EtwSession.Source.Kernel.TcpIpDisconnect += data =>
                    {
                        lock (rotationMutex)
                        {
                            if (m_ProcessIDs[rotationIndex].ContainsKey(data.ProcessID))
                            {
                                //Console.WriteLine($"detected {data.ProcessID} tcp disconnect");
                                lock (m_ProcessIDs[rotationIndex][data.ProcessID])
                                {
                                    SessionData new_data = new SessionData();
                                    new_data.disconnected = true;
                                    new_data.received = data.size;
                                    new_data.timestamp = data.TimeStamp;
                                    m_ProcessIDs[rotationIndex][data.ProcessID].Add(new_data);
                                    //m_ProcessIDs[data.ProcessID].disconnected = true;
                                    //m_ProcessIDs[data.ProcessID].received = data.size;
                                    //m_ProcessIDs[data.ProcessID].timestamp = data.TimeStamp;
                                }
                            }

                        }
                    };

                    //m_EtwSession.Source.Kernel.TcpIpSend += data =>
                    //{
                    //    if (cancelToken.IsCancellationRequested)
                    //    {
                    //        // stop the monitor
                    //        return;
                    //    }
                    //    if (m_ProcessIDs.ContainsKey(data.ProcessID))
                    //    {
                    //        lock (m_ProcessIDs[data.ProcessID])
                    //        {
                    //            m_ProcessIDs[data.ProcessID].sent = data.size;
                    //        }
                    //    }
                    //};

                    m_EtwSession.Source.Process();
                }
            }
            catch(Exception exc)
            {
                Console.WriteLine("Exception caught in session ETW");
                Console.WriteLine($"{exc.Message}");
                Console.WriteLine($"{exc.StackTrace}");
            }
        }

        public static List<SessionData> getData(int ProcessID)
        {
            List<SessionData> dataToReturn;// = new SessionData();
            
            lock (rotationMutex)
            {
                dataToReturn = m_ProcessIDs[rotationIndex][ProcessID].ToList();
                m_ProcessIDs[rotationIndex][ProcessID].Clear();
            }
            
            return dataToReturn;
        }

        public static void rotate()
        {
            lock (rotationMutex)
            {
                rotationIndex = (rotationIndex + 1) % 2;
            }
        }
    }
}
