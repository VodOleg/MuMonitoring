using MuMonitoring.DTOs;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring.Static
{
    public class ProcessMonitor
    {
        public ProcessMonitor()
        {
            //
        }

       

        public void publishActiveProcesses()
        {
            Process[] localAll = Process.GetProcessesByName(StateManager.m_config.ProcessName);
            
            


            foreach (var process in localAll)
            {
                bool isMonitored = false;
                foreach(var monitored_process in StateManager.monitored_processes)
                {
                    if (process.Id == monitored_process.process.Id)
                    {
                        // this process already monitored skip
                        isMonitored = true;
                        break;
                    }

                    bool monitored_process_is_alive = false;
                    // clear processes that are not exist anymore
                    foreach(var process_ in localAll)
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
                        StateManager.monitored_processes.Remove(monitored_process);
                    }
                }
                
                if (isMonitored)
                {
                    //this process already monitored continue to next process
                    continue;
                }

                // this is a new process which we should add to the list to monitor
                //ETWwrapper.addProcess(process.Id); // TODO: should use one list
                P_Process monitoredProcess = new P_Process();
                monitoredProcess.process = process;
                monitoredProcess.data_processor = new DataProcessor(process.Id);
                StateManager.monitored_processes.Add(monitoredProcess);
                
                //sort the monitored processes according to their start time
                StateManager.monitored_processes.Sort((x, y) => x.process.StartTime.CompareTo(y.process.StartTime));
            }




        }
    }
}
