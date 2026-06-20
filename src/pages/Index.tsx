import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import MatrixRain from '@/components/MatrixRain';

type Tab = 'home' | 'terminal' | 'scan' | 'brute' | 'logs' | 'hack';

interface Line {
  text: string;
  type?: 'in' | 'out' | 'err' | 'ok' | 'sys';
}

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Главная', icon: 'Home' },
  { id: 'terminal', label: 'Терминал', icon: 'SquareTerminal' },
  { id: 'scan', label: 'Сканирование', icon: 'Radar' },
  { id: 'brute', label: 'Брутфорс', icon: 'KeyRound' },
  { id: 'logs', label: 'Логи', icon: 'ScrollText' },
  { id: 'hack', label: 'Взлом', icon: 'Skull' },
];

const HELP: Record<string, string> = {
  help:    'Список доступных команд',
  whoami:  'Текущий оператор сессии',
  scan:    'scan <ip> — сканировать Minecraft сервер',
  nmap:    'nmap <ip> — порты и плагины сервера',
  ping:    'ping <ip> — проверка пинга сервера',
  players: 'players <ip> — список игроков онлайн',
  banlist: 'banlist <ip> — просмотр банлиста сервера',
  rcon:    'rcon <ip> — подключение к RCON-консоли',
  decrypt: 'decrypt <hash> — расшифровать хэш пароля',
  exploit: 'exploit <ip> — эксплойт уязвимости сервера',
  crack:   'crack <nick> — взлом аккаунта по нику',
  brute:   'brute <nick> — брутфорс пароля Minecraft-аккаунта',
  clear:   'Очистить терминал',
};

const MC_SERVERS = [
  'hypixel.net',
  'mineplex.com',
  'mc.funtime.su',
  'play.cubecraft.net',
  'mc.cheatmine.ru',
];

const MC_NICKS = [
  'Notch', 'Herobrine', 'xX_ProPlayer_Xx', 'CreeperKiller', 'DiamondSword99',
  'SurvivalMaster', 'GrieferPro', 'TNT_Lord', 'EndermanSlayer', 'Steve_Reborn',
];

const MC_PASSWORDS = [
  'minecraft123', 'creeper123', 'steve2024', 'herobrine', 'diamond_sword',
  'enderman99', 'notch1337', 'mc_pass777', 'grass_block', 'TNT_boom!',
];

const Index = () => {
  const [tab, setTab] = useState<Tab>('home');
  const [lines, setLines] = useState<Line[]>([
    { text: 'MC-NEXUS v3.7.1 // Minecraft Server Exploitation Framework', type: 'sys' },
    { text: 'Подключено к Minecraft Network. Введите "help" для команд.', type: 'sys' },
  ]);
  const [cmd, setCmd] = useState('');
  const [logs, setLogs] = useState<Line[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string[]>([]);
  const [hackProgress, setHackProgress] = useState(0);
  const [hacking, setHacking] = useState(false);
  const [hackTarget, setHackTarget] = useState('hypixel.net');
  const [bruteRunning, setBruteRunning] = useState(false);
  const [bruteAttempts, setBruteAttempts] = useState(0);
  const [bruteCurrent, setBruteCurrent] = useState('');
  const [bruteFound, setBruteFound] = useState<string | null>(null);
  const [bruteUser, setBruteUser] = useState('xX_ProPlayer_Xx');
  const bruteTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const pushLog = (text: string) =>
    setLogs((l) => [{ text: `[${new Date().toLocaleTimeString('ru')}] ${text}`, type: 'sys' }, ...l].slice(0, 50));

  const print = (newLines: Line[]) => setLines((l) => [...l, ...newLines]);

  const runCommand = (raw: string) => {
    const input = raw.trim();
    if (!input) return;
    print([{ text: `mc@nexus:~$ ${input}`, type: 'in' }]);
    pushLog(`Команда: ${input}`);
    const [name, ...args] = input.split(' ');
    const arg = args.join(' ');

    switch (name.toLowerCase()) {
      case 'help':
        print(Object.entries(HELP).map(([k, v]) => ({ text: `  ${k.padEnd(10)} ${v}`, type: 'out' })));
        break;
      case 'whoami':
        print([{ text: 'operator // uid=0 role=ADMIN clearance=OP', type: 'ok' }]);
        break;
      case 'clear':
        setLines([]);
        return;
      case 'ping':
        print([
          { text: `Пинг ${arg || 'hypixel.net'}:25565...`, type: 'out' },
          { text: 'Версия: Minecraft 1.20.4 (Paper)', type: 'out' },
          { text: `Пинг: ${Math.floor(Math.random() * 40 + 8)}ms — сервер доступен ✓`, type: 'ok' },
        ]);
        break;
      case 'players':
        {
          const online = Math.floor(Math.random() * 200 + 50);
          const nicks = MC_NICKS.slice(0, 4);
          print([
            { text: `Игроки онлайн на ${arg || 'hypixel.net'}: ${online}/500`, type: 'out' },
            ...nicks.map(n => ({ text: `  • ${n}`, type: 'ok' as Line['type'] })),
            { text: `  • ...и ещё ${online - 4} игроков`, type: 'out' },
          ]);
        }
        break;
      case 'scan':
      case 'nmap':
        print([
          { text: `Сканирование ${arg || 'hypixel.net'}...`, type: 'out' },
          { text: 'PORT 25565/tcp  open   minecraft [Paper 1.20.4]', type: 'ok' },
          { text: 'PORT 25575/tcp  open   rcon [УЯЗВИМ — слабый пароль]', type: 'err' },
          { text: 'PORT 3306/tcp   open   mysql [EXPOSED]', type: 'err' },
          { text: 'Плагины: EssentialsX, WorldGuard, AuthMe, Vault', type: 'out' },
        ]);
        break;
      case 'banlist':
        print([
          { text: `Получение банлиста ${arg || 'mc.funtime.su'}...`, type: 'out' },
          { text: 'Herobrine — причина: griefing, до: never', type: 'ok' },
          { text: 'xXhackerXx — причина: cheat, до: 2025-01-01', type: 'ok' },
          { text: 'TNT_Lord — причина: spam, до: 2024-12-31', type: 'ok' },
        ]);
        break;
      case 'rcon':
        print([
          { text: `Подключение к RCON ${arg || '10.0.0.1'}:25575...`, type: 'out' },
          { text: 'Брутфорс пароля RCON... пароль: "rcon123"', type: 'out' },
          { text: 'RCON доступ получен. Вы — OP на сервере.', type: 'ok' },
          { text: 'Используйте /op, /ban, /stop на своё усмотрение.', type: 'ok' },
        ]);
        break;
      case 'decrypt':
        print([
          { text: `Расшифровка хэша AuthMe ${arg || 'hash'}...`, type: 'out' },
          { text: 'Алгоритм: SHA-256 (AuthMe format)', type: 'out' },
          { text: 'РЕЗУЛЬТАТ: ' + (arg ? MC_PASSWORDS[Math.floor(Math.random() * MC_PASSWORDS.length)] : 'нет данных'), type: 'ok' },
        ]);
        break;
      case 'exploit':
        print([
          { text: `Загрузка эксплойта для ${arg || 'hypixel.net'}...`, type: 'out' },
          { text: 'CVE-2021-44228 (Log4Shell) — Paper 1.8 уязвим', type: 'err' },
          { text: 'Эксплойт применён. Получен shell на сервере.', type: 'ok' },
          { text: 'Доступ к /plugins/AuthMe/accounts.db — захвачен.', type: 'ok' },
        ]);
        break;
      case 'crack':
        print([
          { text: `Взлом аккаунта ${arg || 'Notch'}...`, type: 'out' },
          { text: 'Перебор словаря: minecraft_passwords.txt', type: 'out' },
          { text: 'НАЙДЕНО: ' + (arg || 'Notch') + ':' + MC_PASSWORDS[Math.floor(Math.random() * MC_PASSWORDS.length)], type: 'ok' },
        ]);
        break;
      case 'brute':
        setTab('brute');
        setBruteUser(arg || 'xX_ProPlayer_Xx');
        print([
          { text: `Брутфорс аккаунта ${arg || 'xX_ProPlayer_Xx'} на AuthMe...`, type: 'out' },
          { text: 'Открыта вкладка «Брутфорс».', type: 'ok' },
        ]);
        setTimeout(() => startBrute(arg || 'xX_ProPlayer_Xx'), 100);
        break;
      default:
        print([{ text: `команда не найдена: ${name}. Введите "help"`, type: 'err' }]);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(cmd);
    setCmd('');
  };

  const startScan = () => {
    if (scanning) return;
    setScanning(true);
    setScanResult([]);
    pushLog('Сканирование Minecraft-серверов подсети 192.168.0.0/24');
    const servers = [
      '192.168.0.5    — MC сервер [Vanilla 1.20] :25565 — 12/20 игроков',
      '192.168.0.14   — MC сервер [Paper + AuthMe] :25565 — RCON открыт [УЯЗВИМ]',
      '192.168.0.33   — MC сервер [Spigot 1.8] :25565 — Log4Shell [КРИТ]',
      '192.168.0.51   — Lobby сервер [BungeeCord] :19132',
      '192.168.0.99   — Скрытый сервер [:25566] — ???',
    ];
    servers.forEach((h, i) =>
      setTimeout(() => {
        setScanResult((r) => [...r, h]);
        if (i === servers.length - 1) setScanning(false);
      }, (i + 1) * 700)
    );
  };

  const startHack = () => {
    if (hacking) return;
    setHacking(true);
    setHackProgress(0);
    pushLog(`Взлом RCON сервера ${hackTarget}`);
    const interval = setInterval(() => {
      setHackProgress((p) => {
        const next = p + Math.random() * 12;
        if (next >= 100) {
          clearInterval(interval);
          setHacking(false);
          pushLog(`OP-ДОСТУП ПОЛУЧЕН: ${hackTarget} — вы администратор сервера`);
          return 100;
        }
        return next;
      });
    }, 300);
  };

  const startBrute = (user?: string) => {
    if (bruteRunning) return;
    const target = user || bruteUser || 'xX_ProPlayer_Xx';
    setBruteUser(target);
    setBruteRunning(true);
    setBruteFound(null);
    setBruteAttempts(0);
    setBruteCurrent('');
    pushLog(`Брутфорс AuthMe: цель ${target}`);
    const finalPass = MC_PASSWORDS[Math.floor(Math.random() * MC_PASSWORDS.length)];
    const goal = 60 + Math.floor(Math.random() * 30);
    let count = 0;
    bruteTimer.current = setInterval(() => {
      count++;
      setBruteAttempts((a) => a + Math.floor(Math.random() * 4000) + 1500);
      const variants = ['minecraft', 'creeper', '123456', 'pass', 'qwerty', 'sword', 'diamond', 'notch', 'enderman', 'tnt'];
      const rnd = variants[Math.floor(Math.random() * variants.length)] + Math.floor(Math.random() * 999);
      setBruteCurrent(rnd);
      if (count >= goal) {
        if (bruteTimer.current) clearInterval(bruteTimer.current);
        setBruteCurrent(finalPass);
        setBruteFound(finalPass);
        setBruteRunning(false);
        pushLog(`ПАРОЛЬ НАЙДЕН: /login ${finalPass} (${target})`);
      }
    }, 60);
  };

  const stopBrute = () => {
    if (bruteTimer.current) clearInterval(bruteTimer.current);
    setBruteRunning(false);
    pushLog('Брутфорс остановлен оператором');
  };

  useEffect(() => () => { if (bruteTimer.current) clearInterval(bruteTimer.current); }, []);

  const lineColor = (t?: Line['type']) =>
    t === 'err' ? 'text-destructive'
    : t === 'ok' ? 'text-primary text-glow'
    : t === 'in' ? 'text-secondary text-glow-cyan'
    : t === 'sys' ? 'text-muted-foreground'
    : 'text-foreground';

  return (
    <div className="min-h-screen grid-bg scanlines relative overflow-hidden">
      <MatrixRain />
      <div className="pointer-events-none fixed left-0 right-0 h-24 bg-gradient-to-b from-primary/10 to-transparent animate-scan -z-[5]" />

      <header className="border-b border-border bg-card/70 backdrop-blur-sm sticky top-0 z-20">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Icon name="Terminal" className="text-primary text-glow" size={26} />
            <span className="font-display font-black tracking-widest text-lg text-primary text-glow">MC-NEXUS</span>
            <span className="text-muted-foreground text-xs hidden sm:inline">// minecraft exploitation terminal</span>
          </div>
          <span className="text-xs text-secondary animate-flicker">● ОНЛАЙН</span>
        </div>
        <nav className="container flex gap-1 overflow-x-auto pb-2">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm whitespace-nowrap border transition-all ${
                tab === n.id
                  ? 'border-primary text-primary text-glow bg-primary/10 animate-glow-pulse'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              <Icon name={n.icon} size={15} />
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="container py-8 relative z-10 animate-fade-in" key={tab}>

        {tab === 'home' && (
          <div className="max-w-3xl">
            <div className="text-5xl mb-3">⛏</div>
            <h1 className="font-display font-black text-4xl sm:text-6xl text-primary text-glow leading-none mb-2">
              ВЗЛОМАЙ
              <br />
              <span className="text-secondary text-glow-cyan">MINECRAFT</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mb-8 mt-4">
              Боевой терминал для работы с Minecraft-серверами. Сканируй сети,
              брутфорси AuthMe, получай RCON-доступ, взламывай аккаунты игроков.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {NAV.slice(1).map((n) => (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  className="text-left border border-border bg-card/60 p-4 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <Icon name={n.icon} className="text-primary mb-3 group-hover:text-glow" size={24} />
                  <div className="font-display font-bold text-foreground">{n.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">модуль активен</div>
                </button>
              ))}
            </div>
            <div className="mt-6 border border-border bg-card/60 p-4">
              <div className="text-xs text-muted-foreground mb-2">ИЗВЕСТНЫЕ ЦЕЛИ</div>
              <div className="flex flex-wrap gap-2">
                {MC_SERVERS.map(s => (
                  <span key={s} className="border border-primary/40 text-primary text-xs px-2 py-1">{s}</span>
                ))}
              </div>
            </div>
            <div className="mt-3 border border-border bg-card/60 p-4">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>СЕРВЕРОВ НАЙДЕНО: 4096</span>
                <span>RCON ОТКРЫТ: 127</span>
                <span className="text-destructive">УЯЗВИМЫХ: 38</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'terminal' && (
          <div className="border border-border bg-card/80 backdrop-blur-sm max-w-4xl">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-destructive/70" />
              <span className="w-3 h-3 rounded-full bg-secondary/70" />
              <span className="w-3 h-3 rounded-full bg-primary/70" />
              <span className="ml-2">operator@mc-nexus — bash</span>
            </div>
            <div className="h-[55vh] overflow-y-auto p-4 text-sm leading-relaxed">
              {lines.map((l, i) => (
                <div key={i} className={lineColor(l.type)}>{l.text}</div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={onSubmit} className="flex items-center border-t border-border px-4 py-2">
              <span className="text-primary text-glow mr-2">mc@nexus:~$</span>
              <input
                autoFocus
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground caret-primary"
                placeholder="scan hypixel.net | players mc.funtime.su | brute Notch"
              />
              <span className="text-primary animate-blink">▋</span>
            </form>
          </div>
        )}

        {tab === 'scan' && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-primary text-glow">Сканер MC-серверов</h2>
              <button
                onClick={startScan}
                disabled={scanning}
                className="flex items-center gap-2 border border-primary text-primary px-4 py-2 hover:bg-primary/10 disabled:opacity-50 transition-all"
              >
                <Icon name={scanning ? 'LoaderCircle' : 'Radar'} size={16} className={scanning ? 'animate-spin' : ''} />
                {scanning ? 'Сканирую...' : 'Запустить скан'}
              </button>
            </div>
            <div className="border border-border bg-card/70 min-h-[40vh] p-4 space-y-2">
              {scanResult.length === 0 && !scanning && (
                <p className="text-muted-foreground text-sm">Нажмите «Запустить скан» — найдём Minecraft серверы в подсети с открытым портом 25565.</p>
              )}
              {scanResult.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm animate-fade-in border-b border-border/40 pb-2">
                  <span className="text-lg">⛏</span>
                  <span className={h.includes('УЯЗВИМ') || h.includes('КРИТ') || h.includes('???') ? 'text-destructive' : 'text-foreground'}>{h}</span>
                </div>
              ))}
              {scanning && <span className="text-primary text-sm animate-blink">▋ поиск Minecraft-серверов на порту 25565...</span>}
            </div>
          </div>
        )}

        {tab === 'brute' && (
          <div className="max-w-3xl">
            <h2 className="font-display font-bold text-xl text-secondary text-glow-cyan mb-1">Брутфорс AuthMe</h2>
            <p className="text-muted-foreground text-xs mb-4">Перебор паролей для команды /login на серверах с плагином AuthMe</p>
            <div className="border border-border bg-card/70 p-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center border border-border bg-background px-3 flex-1">
                  <span className="text-muted-foreground mr-2 text-sm">ник:</span>
                  <input
                    value={bruteUser}
                    onChange={(e) => setBruteUser(e.target.value)}
                    disabled={bruteRunning}
                    placeholder="никнейм игрока"
                    className="bg-transparent outline-none py-2 text-foreground w-full caret-secondary"
                  />
                </div>
                {bruteRunning ? (
                  <button
                    onClick={stopBrute}
                    className="flex items-center justify-center gap-2 border border-destructive text-destructive px-5 py-2 hover:bg-destructive/10 transition-all font-display font-bold"
                  >
                    <Icon name="Square" size={16} /> СТОП
                  </button>
                ) : (
                  <button
                    onClick={() => startBrute()}
                    className="flex items-center justify-center gap-2 border border-secondary text-secondary px-5 py-2 hover:bg-secondary/10 transition-all font-display font-bold"
                  >
                    <Icon name="KeyRound" size={16} /> АТАКА
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground mb-1">ПОПЫТОК /login</div>
                  <div className="text-2xl font-display font-black text-secondary text-glow-cyan tabular-nums">
                    {bruteAttempts.toLocaleString('ru')}
                  </div>
                </div>
                <div className="border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground mb-1">СТАТУС</div>
                  <div className="text-sm font-bold mt-1">
                    {bruteRunning ? (
                      <span className="text-secondary animate-flicker">ПЕРЕБОР...</span>
                    ) : bruteFound ? (
                      <span className="text-primary text-glow">ПАРОЛЬ НАЙДЕН</span>
                    ) : (
                      <span className="text-muted-foreground">ОЖИДАНИЕ</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-border bg-background p-4 font-mono text-sm min-h-[60px]">
                <span className="text-muted-foreground">/login </span>
                {bruteFound ? (
                  <span className="text-primary text-glow">{bruteFound} ✓</span>
                ) : (
                  <span className="text-secondary">{bruteCurrent || '••••••••'}</span>
                )}
                {bruteRunning && <span className="text-secondary animate-blink ml-1">▋</span>}
              </div>

              {bruteFound && (
                <div className="mt-4 text-primary text-glow text-center py-3 border border-primary animate-fade-in font-display font-bold">
                  ✓ ДОСТУП К АККАУНТУ — {bruteUser} / /login {bruteFound}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'logs' && (
          <div className="max-w-3xl">
            <h2 className="font-display font-bold text-xl text-primary text-glow mb-4">Системные логи</h2>
            <div className="border border-border bg-card/70 min-h-[40vh] p-4 text-sm space-y-1">
              {logs.length === 0 && <p className="text-muted-foreground">Журнал пуст. Начни с терминала или сканирования.</p>}
              {logs.map((l, i) => (
                <div key={i} className="text-muted-foreground animate-fade-in">
                  <span className="text-primary">›</span> {l.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'hack' && (
          <div className="max-w-2xl">
            <h2 className="font-display font-bold text-xl text-destructive mb-1">Взлом RCON</h2>
            <p className="text-muted-foreground text-xs mb-4">Брутфорс пароля RCON → получение OP-прав администратора сервера</p>
            <div className="border border-border bg-card/70 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⛏</span>
                <div>
                  <div className="text-xs text-muted-foreground">ЦЕЛЬ</div>
                  <select
                    value={hackTarget}
                    onChange={(e) => setHackTarget(e.target.value)}
                    className="bg-background border border-border text-secondary px-2 py-1 text-sm mt-1 outline-none"
                  >
                    {MC_SERVERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-4">
                <div className="border border-border bg-background p-2 text-center">
                  <div>ПОРТ</div><div className="text-secondary font-bold">25575</div>
                </div>
                <div className="border border-border bg-background p-2 text-center">
                  <div>ПРОТОКОЛ</div><div className="text-secondary font-bold">RCON</div>
                </div>
                <div className="border border-border bg-background p-2 text-center">
                  <div>СТАТУС</div>
                  <div className={hackProgress >= 100 ? 'text-primary font-bold' : 'text-destructive font-bold'}>
                    {hackProgress >= 100 ? 'OP' : 'LOCK'}
                  </div>
                </div>
              </div>
              <div className="h-4 border border-border bg-background mb-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 animate-glow-pulse"
                  style={{ width: `${hackProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-6">
                <span>{hacking ? 'Перебор RCON пароля...' : hackProgress >= 100 ? 'RCON ВЗЛОМАН — ВЫ ОП' : 'ожидание'}</span>
                <span className="text-primary">{Math.floor(hackProgress)}%</span>
              </div>
              {hackProgress >= 100 ? (
                <div className="text-primary text-glow text-center py-3 border border-primary animate-fade-in font-display font-bold">
                  ✓ /op operator — вы администратор {hackTarget}
                </div>
              ) : (
                <button
                  onClick={startHack}
                  disabled={hacking}
                  className="w-full flex items-center justify-center gap-2 border border-destructive text-destructive py-3 hover:bg-destructive/10 disabled:opacity-50 transition-all font-display font-bold"
                >
                  <Icon name="Skull" size={18} />
                  {hacking ? 'ВЗЛАМЫВАЮ RCON...' : 'ВЗЛОМАТЬ RCON'}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="container py-6 text-center text-xs text-muted-foreground relative z-10">
        MC-NEXUS // канал зашифрован — соединение через Minecraft Network
      </footer>
    </div>
  );
};

export default Index;
