using MuMonitoring.Static;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Timers;
namespace MuMonitoring
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public List<ProcessControler> m_monitoredProcessesUC;
        public ProcessMonitor m_pMonitor = null;
        public static string m_sCurrentVersion;
        public static List<string> m_logList = new List<string>();
        private static Dictionary<string, System.Timers.Timer> m_Timers = new Dictionary<string, System.Timers.Timer>();
        

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
            // TODO: only re render processes when something changed
            // TODO: Set single timer for all the circles
            // potential memory leak here
            this.Dispatcher.Invoke(() => {
                foreach(var item in mainContainer.Children)
                {
                    if( item is ScrollViewer _sv)
                    {
                        if ( _sv.Content is StackPanel _sp)
                        {
                            foreach(var processController in _sp.Children)
                            {
                                if( processController is ProcessControler _pc)
                                {
                                    _pc.Dispose();
                                }
                            }
                            _sp.Children.Clear();
                        }
                        _sv.Content = null;
                    }
                }
                mainContainer.Children.Clear();
                m_monitoredProcessesUC.Clear();

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
            bool processesChanged = m_pMonitor.publishActiveProcesses();

            if (processesChanged)
            {
                renderProcessUC();
            }
        }

        private void UCupdater()
        {
            foreach(var uc_ in m_monitoredProcessesUC)
            {
                uc_.update();
            }
        }

        private void startClient()
        {
            refreshProcesses();

            m_Timers["UIRefresh"] = new System.Timers.Timer(StateManager.m_config.ClientRefreshTimeSec * 1000);
            m_Timers["UIRefresh"].Elapsed += (Object source, ElapsedEventArgs e) => { this.refreshProcesses(); };

            m_Timers["DataAnalyzer"] = new System.Timers.Timer(StateManager.m_config.pollingIntervalMS);
            m_Timers["DataAnalyzer"].Elapsed += (Object source, ElapsedEventArgs e) => { this.m_pMonitor.analyzeData(); };
            
            m_Timers["KeepAlive"] = new System.Timers.Timer(StateManager.m_config.KeepAliveTimeSec * 1000);
            m_Timers["KeepAlive"].Elapsed += (Object source, ElapsedEventArgs e) => { BackendCom.sendDataToBE(); };

            m_Timers["UCupdater"] = new System.Timers.Timer(1000);
            m_Timers["UCupdater"].Elapsed += (Object source, ElapsedEventArgs e) => { this.UCupdater(); };

            foreach (var timer_ in m_Timers)
            {
                timer_.Value.Start();
            }
            
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
