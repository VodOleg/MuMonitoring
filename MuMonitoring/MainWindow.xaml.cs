using MuMonitoring.DTOs;
using MuMonitoring.Static;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
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
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public List<ProcessControler> m_monitoredProcessesUC;
        public ProcessMonitor m_pMonitor = null;
        bool stopPeriodicFunction = false;
        public BackgroundWorker bw; 
        public MainWindow()
        {
            InitializeComponent();
            CustomInit();
            Authentication.AddHandler(Authentication.ConnectedEvent, new RoutedEventHandler(ConnectedHandler));
            m_pMonitor = new ProcessMonitor();
            m_monitoredProcessesUC = new List<ProcessControler>();
        }

        void ConnectedHandler(Object sender, RoutedEventArgs e)
        {
            e.Handled = true;
            Authentication.Visibility = Visibility.Hidden;
            headingLabel.Text = "Monitoring the following processes:";
            startClient();
        }

        private void renderProcessUC()
        {
            this.Dispatcher.Invoke(() => {
                mainContainer.Children.Clear();
                ScrollViewer sv = new ScrollViewer();
                StackPanel sp = new StackPanel();
                sv.VerticalScrollBarVisibility = ScrollBarVisibility.Auto;

                lock (StateManager.monitoredProcessesMutex)
                {
                    foreach (var process in StateManager.monitored_processes)
                    {
                        ProcessControler vs = new ProcessControler();
                        vs.CustomInit(process);
                        sp.Children.Add(vs);
                        m_monitoredProcessesUC.Add(vs);
                    }
                }
                
                sv.Content = sp;
                mainContainer.Children.Add(sv);

            });
        }

        private void refreshProcesses()
        {
            m_pMonitor.publishActiveProcesses(); // make periodic

            // render the user controls
            renderProcessUC();

        }

        private void periodicFunction(object sender, DoWorkEventArgs e)
        {
            while (!this.stopPeriodicFunction)
            {
                Thread.Sleep(5000);
                this.refreshProcesses();
            }
        }

        private void startClient()
        {
            refreshProcesses();

            bw = new BackgroundWorker();
            bw.DoWork += this.periodicFunction;
            bw.RunWorkerAsync();
            //Task.Factory.StartNew(() => periodicFunction());
            
        }


        private void CustomInit()
        {
            Log.Start();
            BackendCom.Init();
        }

        private void ExitBtn_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
    }
}
