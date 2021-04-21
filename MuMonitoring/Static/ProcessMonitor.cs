using MuMonitoring.DTOs;
using System.Diagnostics;
using System.Linq;

namespace MuMonitoring.Static
{
    public class ProcessMonitor
    {
        public ProcessMonitor()
        {
            //
        }

       

        public bool publishActiveProcesses()
        {
            Process[] localAll = Process.GetProcessesByName(StateManager.m_config.ProcessName);
            bool monitoredProcessesChanged = false;

            lock (StateManager.monitoredProcessesMutex)
            {
                // remove dead processes
                foreach (var monitored_process in StateManager.monitored_processes.ToList())
                {
                    bool monitored_process_is_alive = false;
                    // clear processes that are not exist anymore
                    foreach (var process_ in localAll)
                    {
                        if (process_.Id == monitored_process.process.Id)
                        {
                            // process still alive
                            monitored_process_is_alive = true;
                            break;
                        }
                    }

                    if (!monitored_process_is_alive)
                    {
                        // monitored process is dead, should remove it from list
                        ETWwrapper.removeProcess(monitored_process.process.Id);

                        StateManager.monitored_processes.Remove(monitored_process);

                        monitoredProcessesChanged = true;
                    }
                }

                foreach (var process in localAll)
                {
                    bool isMonitored = false;
                    foreach (var monitored_process in StateManager.monitored_processes.ToList())
                    {
                        if (process.Id == monitored_process.process.Id)
                        {
                            // this process already monitored skip
                            isMonitored = true;
                            break;
                        }
                    }

                    if (isMonitored)
                    {
                        //this process already monitored continue to next process
                        continue;
                    }

                    // this is a new process which we should add to the list to monitor
                    P_Process monitoredProcess = new P_Process();
                    monitoredProcess.doMonitor = true;
                    monitoredProcess.process = process;
                    monitoredProcess.data_processor = new DataProcessor(process.Id);
                    StateManager.monitored_processes.Add(monitoredProcess);
                    
                    ETWwrapper.addProcess(process.Id); 

                    //sort the monitored processes according to their start time
                    StateManager.monitored_processes.Sort((x, y) => x.process.StartTime.CompareTo(y.process.StartTime));

                    monitoredProcessesChanged = true;
                }

            }
            return monitoredProcessesChanged;
        }

        public void analyzeData()
        {
            foreach (var process in StateManager.monitored_processes.ToList())
                {
                    SessionData somedata = ETWwrapper.getData(process.process.Id);
                    process.data_processor.Append(somedata);
                    process.disconnected = somedata.disconnected;
                    process.suspicious = somedata.suspicious;
                    ClientProcessDTO newData = new ClientProcessDTO()
                    {
                        processID = process.process.Id,
                        alias = process.alias,
                        disconnected = somedata.disconnected,
                        suspicious = somedata.suspicious,
                        timestamp = somedata.timestamp
                    };
                StateManager.addData(newData);
               
                }
        }

        public void run()
        {
            ETWwrapper.start();
        }

        internal void resetAll()
        {
            lock (StateManager.monitored_processes)
            {
                foreach(var process in StateManager.monitored_processes)
                {
                    process.disconnected = false;
                    process.suspicious = false;
                    process.doMonitor = true;
                }
            }
        }
    }
}
