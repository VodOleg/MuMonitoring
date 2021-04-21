using MuMonitoring.DTOs;
using MuMonitoring.Static;
using System;
using System.Timers;
using System.Windows.Controls;
using System.Windows.Media;

namespace MuMonitoring
{
    /// <summary>
    /// Interaction logic for ProcessControler.xaml
    /// </summary>
    public partial class ProcessControler : UserControl,IDisposable
    {
        private P_Process p_process;
        bool monitor = true;
        bool isColored = true;
        System.Timers.Timer m_timer;

        public ProcessControler()
        {
            InitializeComponent();
        }

        private void changeCircleColor() 
        {
            this.Dispatcher.Invoke(() => {
            if (this == null || this.p_process == null)
            {
                return;
            }
            if (this.isColored && this.p_process.doMonitor)
            {
                if (this.p_process != null)
                {

                    if (this.p_process.disconnected)
                    {
                        statusCircle.Fill = new SolidColorBrush(Colors.Red); ;
                    }
                    else if (this.p_process.suspicious)
                    {
                        statusCircle.Fill = new SolidColorBrush(Colors.Orange);
                    }
                    else
                    {
                        statusCircle.Fill = new SolidColorBrush(Colors.LightGreen);
                    }
                }
            }
            else
            {
                statusCircle.Fill = new SolidColorBrush(Colors.Transparent);
            }
            this.isColored = !this.isColored;
            });
        }

        public void CustomInit(P_Process process)
        {
            this.p_process = process;
            processTitle.Content = $"{process.process.ProcessName} ({process.process.Id})";
            
            if (p_process!=null && !String.IsNullOrEmpty(p_process.alias))
            {
                txtAlias.Text = process.alias;
            }
            else
            {
                txtAlias.Text = process.process.Id.ToString();
            }

            this.doMonitor.IsChecked = process.doMonitor;

            //start Timer
            m_timer = new System.Timers.Timer(1000);
            m_timer.Elapsed += (Object source, ElapsedEventArgs e) => { this.changeCircleColor(); };
            m_timer.Start();
        }

        public int getProcessID()
        {
            return p_process.process.Id;
        }

        public object getSelected()
        {
            return monitor;
        }


        private void DoMonitor_Checked(object sender, System.Windows.RoutedEventArgs e)
        {
            
            if (p_process!=null)
                p_process.doMonitor = true;
            this.monitor = true;
        }

        private void DoMonitor_Unchecked(object sender, System.Windows.RoutedEventArgs e)
        {
            if (p_process!=null)
                p_process.doMonitor = false;
            this.monitor = false;
        }

        private void TextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (p_process!=null)
                p_process.alias = txtAlias.Text;
        }

        public void Dispose()
        {
            this.m_timer.Stop();
            this.m_timer.Dispose();
            p_process = null;
        }
    }
}
