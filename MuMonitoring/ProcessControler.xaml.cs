using MuMonitoring.DTOs;
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
    /// Interaction logic for ProcessControler.xaml
    /// </summary>
    public partial class ProcessControler : UserControl
    {
        private P_Process p_process;
        bool monitor = true;

        public ProcessControler()
        {
            InitializeComponent();
        }

        public void CustomInit(P_Process process)
        {
            this.p_process = process;
            processTitle.Content = $"{process.process.ProcessName} ({process.process.Id})";

        }

        public int getProcessID()
        {
            return p_process.process.Id;
        }

        public object getSelected()
        {

            return monitor;
        }


        private void DoInstall_Checked(object sender, System.Windows.RoutedEventArgs e)
        {
            this.monitor = true;
        }

        private void DoInstall_Unchecked(object sender, System.Windows.RoutedEventArgs e)
        {
            this.monitor = false;
        }
    }
}
