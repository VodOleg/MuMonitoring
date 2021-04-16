using MuMonitoring.Static;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Threading;
using System.Windows;
using System.Windows.Controls;

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
        public BackgroundWorker bw_refreshThread; 
        public BackgroundWorker bw_dataAnalyzer;
        public BackgroundWorker bw_BE_reporter;
        public static string m_sCurrentVersion;
        private static string[] m_dialogStrings = new string[2];
        private static int dialog_index = 0;
        public static List<string> m_logList = new List<string>();

        

        private void logRequested(object sender, EventArgs e)
        {
            log(null);
        }

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
            label_sessionN.Visibility = Visibility.Visible;
            label_sessionK.Visibility = Visibility.Visible;
            label_SessionName.Content = StateManager.m_creds.username;
            label_SessionKey.Content = StateManager.m_creds.sessionKey;
            Refresh_btn.Visibility = Visibility.Visible;
            log_container_border.Visibility = Visibility.Visible;

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

        private void periodicUIRefresherHandle(object sender, DoWorkEventArgs e)
        {
            Log.Write("starting UI refresh thread");
            while (!this.stopPeriodicFunction)
            {
                Thread.Sleep(StateManager.m_config.ClientRefreshTimeSec * 1000);
                this.refreshProcesses();
            }
        }

        private void periodicDataExtraction (object sender, DoWorkEventArgs e)
        {
            Log.Write("starting data extraction thread");
            while (!this.stopPeriodicFunction)
            {
                m_pMonitor.analyzeData();
                Thread.Sleep(StateManager.m_config.pollingIntervalMS);
            }
        }

        private void periodicKeepAlive(object sender, DoWorkEventArgs e)
        {
            Log.Write("starting keep alive thread");
            while (!this.stopPeriodicFunction)
            {
                Thread.Sleep(StateManager.m_config.KeepAliveTimeSec * 1000);
                BackendCom.sendDataToBE();
            }
        }

        private void startClient()
        {
            refreshProcesses();

            bw_refreshThread = new BackgroundWorker();
            bw_refreshThread.DoWork += this.periodicUIRefresherHandle;
            bw_refreshThread.RunWorkerAsync();
            m_pMonitor.run();

            bw_dataAnalyzer = new BackgroundWorker();
            bw_dataAnalyzer.DoWork += this.periodicDataExtraction;
            bw_dataAnalyzer.RunWorkerAsync();

            bw_BE_reporter = new BackgroundWorker();
            bw_BE_reporter.DoWork += this.periodicKeepAlive;
            bw_BE_reporter.RunWorkerAsync();

        }


        private void changeVersionInTitle()
        {
            m_sCurrentVersion = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version.ToString();
            this.Dispatcher.Invoke(() => {
                this.Title = $"MuMonitor {m_sCurrentVersion}";
            });
        }

        public void log(string message)
        {
            DateTime now_ = DateTime.Now;
            if (!string.IsNullOrEmpty(message))
            {
                string msg = $"{now_.Hour}:{now_.Minute} - {message}\n";
                m_logList.Add(msg);
            }
            this.Dispatcher.Invoke(() => {
                log_container.Children.Clear();
                ScrollViewer sv = new ScrollViewer();
                StackPanel sp = new StackPanel();
                sv.VerticalScrollBarVisibility = ScrollBarVisibility.Auto;
                foreach(var i in m_logList)
                {
                    TextBlock tb = new TextBlock();
                    tb.TextWrapping = TextWrapping.Wrap;
                    tb.Text = i;
                    tb.Padding = new Thickness(5);
                    tb.Height = 20;
                    sp.Children.Add(tb);
                }
                sv.Content = sp;
                log_container.Children.Add(sv);
            
                

            });

        }

        private void CustomInit()
        {
            Log.Start();
            Utils.newLogMessage += new EventHandler(logRequested);
            changeVersionInTitle();
            BackendCom.Init();
        }

        private void ExitBtn_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void Refresh_btn_Click(object sender, RoutedEventArgs e)
        {
            m_pMonitor.resetAll();
            refreshProcesses();
        }
    }
}
