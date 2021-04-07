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
            
            if (p_process!=null && !String.IsNullOrEmpty(p_process.alias))
            {
                txtAlias.Text = process.alias;
            }
            else
            {
                txtAlias.Text = process.process.Id.ToString();
            }
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
            
            if (p_process!=null)
                p_process.doMonitor = true;
            this.monitor = true;
        }

        private void DoInstall_Unchecked(object sender, System.Windows.RoutedEventArgs e)
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
