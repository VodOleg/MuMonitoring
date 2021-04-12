using MuMonitoring.DTOs;
using MuMonitoring.Static;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace MuMonitoring
{
    /// <summary>
    /// Interaction logic for ProcessControler.xaml
    /// </summary>
    public partial class ProcessControler : UserControl
    {
        private P_Process p_process;
        bool monitor = true;
        bool stopPeriodicStatus = false;
        bool isColored = true;
        Task bw_statusLed;

        public ProcessControler()
        {
            InitializeComponent();
            InitPeriodic();
        }

        private void InitPeriodic()
        {
            bw_statusLed = Task.Run(() =>
            {
                this.periodicStatusFunction();
            });
        }

        private void changeCircleColor() 
        {
            this.Dispatcher.Invoke(() => {
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

        private void periodicStatusFunction()
        {
            while (!this.stopPeriodicStatus)
            {
                Thread.Sleep(1000);
                this.changeCircleColor();
            }
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
    }
}
