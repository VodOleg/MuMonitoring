using MuMonitoring.Static;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MuMonitoring
{
    public class DataProcessor:IDisposable
    {
        private int intervalMS { get; set; }
        private int suspiciousThreshold { get; set; }
        private int suspiciousPacketCounter = 0;
        private int updateCounter = 0;
        private int updateThreshold = 59;
        private int processID { get; set; }
        AnalisysWindow analysis_window;
        private int m_sequentialBadBehaviorFrameSize;
        private bool m_behaviourIsOk = true;
        private int m_behaviour_counter = 0;
        private bool stopNotifyingStatistics = false;

        public DataProcessor(int processID)
        {
            this.intervalMS = 10000;  // should be removed? 
            this.suspiciousThreshold = 6; // should be removed ?
            this.processID = processID;
            this.updateThreshold = 60; // should be removed? 
            this.analysis_window = new AnalisysWindow(StateManager.m_config.AnalysisWindowSize);
            this.m_sequentialBadBehaviorFrameSize = StateManager.m_config.SequentialBadBehaviourFrameSize;
            
        }

        private bool statisticsAreBad(double val) {
            bool behaviorIsOk = analysis_window.AppendAndCheck(val);

            if (behaviorIsOk && !m_behaviourIsOk)
            {
                // new is ok last one was bad - reset
                m_behaviour_counter = 0;
            }
            else if (!behaviorIsOk && !m_behaviourIsOk)
            {
                //previous not good, new one not good
                m_behaviour_counter++;
            }
            else if( !behaviorIsOk && m_behaviourIsOk)
            {
                //new one is not ok, but previous was ok
                m_behaviour_counter++;
            }
            else
            {
                //both are ok
                m_behaviour_counter = 0;
            }

            return m_behaviour_counter >= m_sequentialBadBehaviorFrameSize && analysis_window.isReady(); 
        }

        public void Append(List<SessionData> data_list)
        {

            updateCounter++;

            if (updateCounter > updateThreshold)
            {
                updateCounter = 0;
            }

            foreach(var data_ in data_list)
            {

                if (statisticsAreBad(data_.received) && !stopNotifyingStatistics)
                {
                    suspiciousPacketCounter = 0;
                    data_.suspicious = true;
                    data_.reason = "statistics are bad";
                }

                //double milliseconds_passed_since_data = DateTime.Now.Subtract(data_.timestamp).TotalMilliseconds;
                //if (milliseconds_passed_since_data > intervalMS)
                //{
                //    suspiciousPacketCounter++;
                //}

            

                //if (suspiciousPacketCounter > suspiciousThreshold)
                //{
                //    data_.suspicious = true;
                //    data_.reason = $"suspicious packet counter = {suspiciousPacketCounter}";
                //    suspiciousPacketCounter = 0;
                //}
                if ( data_list.Count < 15)
                {
                    data_.suspicious = true;
                    data_.reason = $"packets count : {data_list.Count}";
                }
            }
            
        }

        public void Dispose()
        {
            this.analysis_window = null;
        }
    }

    class AnalisysWindow
    {
        private int windowSize;
        private Queue<double> container_;
        public AnalisysWindow(int windowSize)
        {
            this.windowSize = windowSize;
            container_ = new Queue<double>(windowSize);
        }

        public void Append(double newValue)
        {
            lock (container_)
            {
                if (container_.Count >= this.windowSize)
                {
                    container_.Dequeue();
                }
                container_.Enqueue(newValue);
            }
        }

        private float variance(double[] a)
        {
            int n = a.Length;
            // Compute mean (average 
            // of elements) 
            double sum = 0;

            for (int i = 0; i < n; i++)
                sum += a[i];

            double mean = (double)sum /
                          (double)n;

            // Compute sum squared  
            // differences with mean. 
            double sqDiff = 0;

            for (int i = 0; i < n; i++)
                sqDiff += (a[i] - mean) *
                          (a[i] - mean);

            return (float)sqDiff / n;
        }
        public int numOfSubsets(int bins)
        {

            List<List<double>> subsets = new List<List<double>>(bins);

            if (container_.Count < bins)
                return 0;

            double max_v = container_.Max();
            double min_v = container_.Min();

            double delta = ((max_v - min_v) / (bins));
            if (delta == 0)
            {
                // if max == min -> 1 subset and it is the set itself
                return 1;
            }

            for (int j = 0; j < bins; j++)
            {
                subsets.Add(new List<double>());
            }

            List<double> container = container_.ToList();

            for (int i = 0; i < container.Count; i++)
            {

                int bin_index = (int)(((container[i] - min_v)) / delta);
                subsets[bin_index < bins ? bin_index : bins - 1].Add(container[i]);
            }

            int subsets_count = 0;
            foreach (var subset in subsets)
            {
                if (subset.Count >= 1)
                {
                    subsets_count++;
                }

            }

            return subsets_count;
        }

        private float standardDeviation(double[] arr)
        {
            int n = arr.Length;
            return (float)Math.Sqrt(variance(arr));
        }

        public bool Check()
        {
            bool isValid = true;
            lock (container_)
            {
                var subsets_count = numOfSubsets(10);
                isValid = ((subsets_count > 3)) && container_.Count == windowSize;
            }
            
            return isValid;
        }

        public bool isReady()
        {
            bool ret = false;
            lock (this.container_)
            {
                ret = this.container_.Count == this.windowSize;
            }
            return ret;
        }

        public bool AppendAndCheck(double newValue)
        {
            Append(newValue);

            return Check();
        }

        public string getValues()
        {
            string values = "[";
            var arr = container_.ToArray();
            for (int i = 0; i < arr.Length; i++)
            {
                if (i == arr.Length - 1)
                {
                    values += arr[i];
                }
                else
                {
                    values += arr[i] + ",";
                }

            }
            values += "]";

            return values;

        }
    }
}
