using System.Collections.Concurrent;

namespace FitnessAppBackend.Service
{
    public static class LogService
    {
        private static readonly ConcurrentQueue<string> Logs = new ConcurrentQueue<string>();
        private const int MaxLogs = 500;

        public static void Add(string message)
        {
            Logs.Enqueue(message);

            // Trim to keep memory small
            while (Logs.Count > MaxLogs && Logs.TryDequeue(out _)) { }
        }

        public static IEnumerable<string> GetAll() => Logs.ToList();
    }
}
