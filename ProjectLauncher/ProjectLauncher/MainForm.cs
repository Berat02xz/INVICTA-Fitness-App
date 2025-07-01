using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

namespace ProjectLauncher
{
    public partial class MainForm : Form
    {
        private Process ngrokProcess, dockerProcess, dotnetProcess, expoProcess;

        private bool ngrokRunning = false;
        private bool dockerRunning = false;
        private bool dotnetRunning = false;
        private bool expoRunning = false;

        private Button btnNgrok, btnNgrokDashboard, btnDocker, btnDotnet, btnExpo;
        private TextBox outputBox;
        private Label titleLabel;

        private TextBox apiUrlInput;
        private Button btnSaveApiUrl;

        private readonly string backendPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"..\Fitness-App-Backend\FitnessAppBackend"));
        private readonly string frontendPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"C:\Users\berat\OneDrive\Documents\Github\INFIT-Fitness-App\Fitness-App-Frontend"));


        private readonly string dockerContainerName = "FitnessAppPostgresql";
        private readonly string ngrokPath = @"C:\Users\berat\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe";
        private readonly string envFilePath = @"C:\Users\berat\OneDrive\Documents\Github\INFIT-Fitness-App\.env";

        private readonly Color borderRunningColor = ColorTranslator.FromHtml("#FF2605");
        private readonly Color borderDefaultColor = ColorTranslator.FromHtml("#5B5B5B");
        private readonly Color buttonBackColor = ColorTranslator.FromHtml("#1C1C1C");
        private readonly Color consoleBackColor = ColorTranslator.FromHtml("#1C1C1C");

        public MainForm()
        {
            InitializeComponent();
            SetupUI();
            WireUpEvents();
        }

        private void SetupUI()
        {
            this.Text = "INFIT DEV LAUNCHER";
            this.Width = 250;
            this.Height = 900;
            this.BackColor = Color.Black;
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;

            titleLabel = new Label
            {
                Text = "INFIT DEV LAUNCHER",
                Font = new Font("Segoe UI", 14F, FontStyle.Bold),
                ForeColor = Color.White,
                TextAlign = ContentAlignment.MiddleCenter,
                Dock = DockStyle.Top,
                Height = 40,
                BackColor = borderRunningColor
            };
            Controls.Add(titleLabel);

            // Create buttons
            btnNgrok = CreateButton("Start Ngrok");
            btnNgrokDashboard = CreateButton("Open Ngrok Dashboard");
            btnDocker = CreateButton("Start Docker DB");
            btnDotnet = CreateButton("Start Dotnet Backend");
            btnExpo = CreateButton("Start Expo Frontend");

            // API URL input and save button
            apiUrlInput = new TextBox
            {
                Width = 200,
                Height = 40,
                Left = 20,
                ForeColor = Color.White,
                BackColor = Color.FromArgb(70, 70, 70),
                BorderStyle = BorderStyle.FixedSingle,
                Font = new Font("Segoe UI", 10F),
            };


            btnSaveApiUrl = CreateButton("Save API_URL to .env");
            btnSaveApiUrl.Width = 180;
            btnSaveApiUrl.Height = 30;

            // Output console
            outputBox = new TextBox
            {
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                ReadOnly = true,
                Width = this.ClientSize.Width - 40,
                Height = 250,
                BackColor = consoleBackColor,
                ForeColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle,
                Left = 20,
                Top = 420,
            };

            Controls.AddRange(new Control[] {
                btnNgrok, btnNgrokDashboard, btnDocker, btnDotnet, btnExpo,
                apiUrlInput, btnSaveApiUrl,
                outputBox
            });

            ArrangeControls();
        }

        private Button CreateButton(string text)
        {
            var btn = new Button
            {
                Text = text,
                Width = 200,
                Height = 40,
                BackColor = buttonBackColor,
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 10F),
                TabStop = false,
                Cursor = Cursors.Hand
            };
            btn.FlatAppearance.BorderColor = borderDefaultColor;
            btn.FlatAppearance.BorderSize = 2;
            return btn;
        }

        private void ArrangeControls()
        {
            int marginLeft = 20;
            int marginTop = titleLabel.Bottom + 20;
            int spacingY = 15;       // space between controls inside a group
            int groupSpacingY = 40;  // space between groups

            // --- Group 1: Ngrok ---
            btnNgrok.Left = marginLeft;
            btnNgrok.Top = marginTop;

            btnNgrokDashboard.Left = marginLeft;
            btnNgrokDashboard.Top = btnNgrok.Bottom + spacingY;

            apiUrlInput.Top = btnNgrokDashboard.Bottom + spacingY;
            apiUrlInput.Left = marginLeft;
            apiUrlInput.Width = 200;
            apiUrlInput.Height = 40;

            btnSaveApiUrl.Width = 200;
            btnSaveApiUrl.Height = 40;
            btnSaveApiUrl.Left = marginLeft + (apiUrlInput.Width - btnSaveApiUrl.Width) / 2; // center below input
            btnSaveApiUrl.Top = apiUrlInput.Bottom + spacingY;

            // --- Group 2: Docker ---
            btnDocker.Left = marginLeft;
            btnDocker.Top = btnSaveApiUrl.Bottom + groupSpacingY;
            btnDocker.Width = 200;
            btnDocker.Height = 40;

            // --- Group 3: Backend & Frontend ---
            btnDotnet.Left = marginLeft;
            btnDotnet.Top = btnDocker.Bottom + groupSpacingY;
            btnDotnet.Width = 200;
            btnDotnet.Height = 40;

            btnExpo.Left = marginLeft;
            btnExpo.Top = btnDotnet.Bottom + spacingY;
            btnExpo.Width = 200;
            btnExpo.Height = 40;

            // Output console at bottom
            outputBox.Top = btnExpo.Bottom + groupSpacingY;
            outputBox.Left = marginLeft;
            outputBox.Width = ClientSize.Width - 2 * marginLeft;
            outputBox.Height = ClientSize.Height - outputBox.Top - 20;
        }



        private void WireUpEvents()
        {
            btnNgrok.Click += (s, e) => ToggleNgrok();
            btnNgrokDashboard.Click += (s, e) => OpenNgrokDashboard();
            btnDocker.Click += async (s, e) => await ToggleDocker();
            btnDotnet.Click += (s, e) => ToggleProcess(ref dotnetProcess, ref dotnetRunning, "dotnet", "run", btnDotnet, "Dotnet Backend", backendPath);
            btnExpo.Click += (s, e) => ToggleProcess(ref expoProcess, ref expoRunning, "cmd.exe", "/c npx expo start", btnExpo, "Expo Frontend", frontendPath);
            btnSaveApiUrl.Click += (s, e) => SaveApiUrlFromInput();
        }


        private void ToggleNgrok()
        {
            if (!ngrokRunning)
            {
                try
                {
                    var startInfo = new ProcessStartInfo
                    {
                        FileName = ngrokPath,
                        Arguments = "http https://localhost:7258",
                        UseShellExecute = false,
                        CreateNoWindow = true,
                    };

                    ngrokProcess = Process.Start(startInfo);
                    if (ngrokProcess != null)
                    {
                        ngrokRunning = true;
                        btnNgrok.Text = "Stop Ngrok";
                        SetButtonBorder(btnNgrok, borderRunningColor);
                        AppendOutput("Ngrok started.");
                    }
                    else
                    {
                        AppendOutput("Failed to start Ngrok.");
                    }
                }
                catch (Exception ex)
                {
                    AppendOutput($"Exception starting Ngrok: {ex.Message}");
                }
            }
            else
            {
                try
                {
                    ngrokProcess?.Kill();
                    ngrokProcess?.Dispose();
                    ngrokProcess = null;

                    ngrokRunning = false;
                    btnNgrok.Text = "Start Ngrok";
                    SetButtonBorder(btnNgrok, borderDefaultColor);
                    AppendOutput("Ngrok stopped.");
                }
                catch (Exception ex)
                {
                    AppendOutput($"Failed to stop Ngrok: {ex.Message}");
                }
            }
        }

        private void OpenNgrokDashboard()
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "https://dashboard.ngrok.com/agents",
                    UseShellExecute = true
                });
                AppendOutput("Opened Ngrok dashboard in browser.");
            }
            catch (Exception ex)
            {
                AppendOutput($"Failed to open Ngrok dashboard: {ex.Message}");
            }
        }


        private void SaveApiUrlFromInput()
        {
            string url = apiUrlInput.Text.Trim();
            if (string.IsNullOrEmpty(url))
            {
                AppendOutput("API URL input is empty.");
                return;
            }
            try
            {
                UpdateEnvApiUrl(envFilePath, "API_URL", url);
            }
            catch (Exception ex)
            {
                AppendOutput($"Failed to save API URL: {ex.Message}");
            }
        }

        private void UpdateEnvApiUrl(string filePath, string key, string url)
        {
            try
            {
                if (!File.Exists(filePath))
                {
                    File.WriteAllText(filePath, $"{key}={url}{Environment.NewLine}");
                    AppendOutput($"Created .env file with {key}={url}");
                    return;
                }

                var lines = File.ReadAllLines(filePath);
                bool found = false;
                for (int i = 0; i < lines.Length; i++)
                {
                    if (lines[i].StartsWith($"{key}="))
                    {
                        lines[i] = $"{key}={url}";
                        found = true;
                        break;
                    }
                }

                if (!found)
                {
                    var list = new List<string>(lines);
                    list.Add($"{key}={url}");
                    lines = list.ToArray();
                }

                File.WriteAllLines(filePath, lines);
                AppendOutput($"Updated {key} in .env file.");
            }
            catch (Exception ex)
            {
                AppendOutput($"Failed to update .env file: {ex.Message}");
            }
        }

        private async System.Threading.Tasks.Task ToggleDocker()
        {
            if (!dockerRunning)
            {
                StartProcess(ref dockerProcess, "docker", $"start {dockerContainerName}", btnDocker, "Docker");

                await System.Threading.Tasks.Task.Delay(2000);

                if (IsDockerRunning(dockerContainerName))
                {
                    AppendOutput($"Docker container '{dockerContainerName}' is running.");
                    SetButtonBorder(btnDocker, borderRunningColor);
                    btnDocker.Text = "Stop Docker DB";
                    dockerRunning = true;
                }
                else
                {
                    AppendOutput($"Docker container '{dockerContainerName}' failed to start.");
                    SetButtonBorder(btnDocker, borderDefaultColor);
                    btnDocker.Text = "Start Docker DB";
                    dockerRunning = false;
                }
            }
            else
            {
                bool stopped = await RunProcessAsync("docker", $"stop {dockerContainerName}");
                if (stopped)
                {
                    AppendOutput($"Docker container '{dockerContainerName}' stopped.");
                    SetButtonBorder(btnDocker, borderDefaultColor);
                    btnDocker.Text = "Start Docker DB";
                    dockerRunning = false;
                }
                else
                {
                    AppendOutput("Failed to stop Docker container.");
                }
            }
        }

        private void ToggleProcess(ref Process proc, ref bool runningFlag, string fileName, string args, Button btn, string name, string workingDir = "")
        {
            if (!runningFlag)
            {
                StartProcess(ref proc, fileName, args, btn, name, workingDir);
                runningFlag = true;
                btn.Text = "Stop " + name;
                SetButtonBorder(btn, borderRunningColor);
            }
            else
            {
                StopProcess(ref proc, btn, name);
                runningFlag = false;
                btn.Text = "Start " + name;
                SetButtonBorder(btn, borderDefaultColor);
            }
        }

        private void StartProcess(ref Process proc, string fileName, string args, Button btn, string name, string workingDir = "")
        {
            if (proc != null && !proc.HasExited)
            {
                AppendOutput($"{name} is already running.");
                return;
            }

            var localProc = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = fileName,
                    Arguments = args,
                    WorkingDirectory = workingDir,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                },
                EnableRaisingEvents = true
            };

            localProc.OutputDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) AppendOutput($"[{name}] {e.Data}"); };
            localProc.ErrorDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) AppendOutput($"[{name} ERROR] {e.Data}"); };
            localProc.Exited += (s, e) =>
            {
                AppendOutput($"{name} exited.");
                if (btn.InvokeRequired)
                {
                    btn.Invoke(new Action(() =>
                    {
                        SetButtonBorder(btn, borderDefaultColor);
                        btn.Text = "Start " + name;
                    }));
                }
                else
                {
                    SetButtonBorder(btn, borderDefaultColor);
                    btn.Text = "Start " + name;
                }
                localProc.Dispose();
            };

            try
            {
                localProc.Start();
                localProc.BeginOutputReadLine();
                localProc.BeginErrorReadLine();
                AppendOutput($"{name} started.");
                proc = localProc; // Assign the local process to the ref parameter after starting it
            }
            catch (Exception ex)
            {
                AppendOutput($"Failed to start {name}: {ex.Message}");
                localProc.Dispose();
                SetButtonBorder(btn, borderDefaultColor);
                btn.Text = "Start " + name;
            }
        }

        private void StopProcess(ref Process proc, Button btn, string name)
        {
            if (proc != null && !proc.HasExited)
            {
                try
                {
                    proc.Kill(); // If targeting .NET 5 or later, this kills tree
                    proc.WaitForExit(5000); // Wait max 5s for exit
                    proc.Dispose();
                    proc = null;

                    AppendOutput($"{name} stopped.");
                    SetButtonBorder(btn, borderDefaultColor);
                    btn.Text = "Start " + name;
                }
                catch (Exception ex)
                {
                    AppendOutput($"Failed to stop {name}: {ex.Message}");
                }
            }
        }






        private void SetButtonBorder(Button btn, Color color)
        {
            if (btn.InvokeRequired)
                btn.Invoke(new Action(() => btn.FlatAppearance.BorderColor = color));
            else
                btn.FlatAppearance.BorderColor = color;
        }

        private void AppendOutput(string text)
        {
            if (InvokeRequired)
                Invoke(new Action(() => AppendOutput(text)));
            else
            {
                outputBox.AppendText(text + Environment.NewLine);
                outputBox.SelectionStart = outputBox.Text.Length;
                outputBox.ScrollToCaret();
            }
        }

        private bool IsDockerRunning(string containerName)
        {
            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName = "docker",
                    Arguments = $"ps -q -f name={containerName}",
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = Process.Start(psi);
                string output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();
                return !string.IsNullOrEmpty(output.Trim());
            }
            catch
            {
                return false;
            }
        }

        private System.Threading.Tasks.Task<bool> RunProcessAsync(string fileName, string args)
        {
            var tcs = new System.Threading.Tasks.TaskCompletionSource<bool>();
            var proc = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = fileName,
                    Arguments = args,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                },
                EnableRaisingEvents = true
            };
            proc.Exited += (s, e) =>
            {
                tcs.TrySetResult(proc.ExitCode == 0);
                proc.Dispose();
            };
            try
            {
                proc.Start();
            }
            catch
            {
                tcs.TrySetResult(false);
            }
            return tcs.Task;
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            base.OnFormClosing(e);

            void SafeKill(Process process)
            {
                try
                {
                    if (process != null && !process.HasExited)
                    {
                        process.Kill();
                        process.Dispose();
                    }
                }
                catch (InvalidOperationException)
                {
                    // Log or handle the invalid process state
                }
            }

            SafeKill(ngrokProcess);
            SafeKill(dockerProcess);
            SafeKill(dotnetProcess);
            SafeKill(expoProcess);
        }

        private void InitializeComponent()
        {
            this.SuspendLayout();
            // 
            // MainForm
            // 
            this.ClientSize = new System.Drawing.Size(520, 600);
            this.Name = "MainForm";
            this.ResumeLayout(false);
        }
    }
}
