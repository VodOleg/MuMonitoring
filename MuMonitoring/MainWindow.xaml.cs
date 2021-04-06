using MuMonitoring.Static;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public ProcessMonitor m_pMonitor = null;
        public MainWindow()
        {
            InitializeComponent();
            CustomInit();
            Authentication.AddHandler(Authentication.ConnectedEvent, new RoutedEventHandler(ConnectedHandler));
            m_pMonitor = new ProcessMonitor();
        }

        void ConnectedHandler(Object sender, RoutedEventArgs e)
        {
            e.Handled = true;
            Authentication.Visibility = Visibility.Hidden;
            startClient();
        }

        private void startClient()
        {
            // try catch ? 
            // start the program
            m_pMonitor.publishActiveProcesses();

            // render the user controls
            foreach (var process in StateManager.monitored_processes)
            {
                Log.Write("monitoring " + process.process.Id + " " + process.process.ProcessName);
            }
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
