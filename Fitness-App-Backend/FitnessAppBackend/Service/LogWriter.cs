using FitnessAppBackend.Service;
using System.IO;
using System.Text;

namespace FitnessAppBackend.Helpers
{
    public class LogWriter : TextWriter
    {
        private readonly TextWriter _originalOut;

        public LogWriter(TextWriter originalOut)
        {
            _originalOut = originalOut;
        }

        public override Encoding Encoding => _originalOut.Encoding;

        public override void WriteLine(string? value)
        {
            _originalOut.WriteLine(value);
            
            if (!string.IsNullOrWhiteSpace(value))
            {
                var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                LogService.Add($"{timestamp} | {value}");
            }
        }

        public override void Write(string? value)
        {
            _originalOut.Write(value);
            
            if (!string.IsNullOrWhiteSpace(value))
            {
                var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                LogService.Add($"{timestamp} | {value}");
            }
        }

    }
}
