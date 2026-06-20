import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import MatrixRain from '@/components/MatrixRain';

type Tab = 'home' | 'terminal' | 'scan' | 'logs' | 'hack';

interface Line {
  text: string;
  type?: 'in' | 'out' | 'err' | 'ok' | 'sys';
}

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Главная', icon: 'Home' },
  { id: 'terminal', label: 'Терминал', icon: 'SquareTerminal' },
  { id: 'scan', label: 'Сканирование', icon: 'Radar' },
  { id: 'logs', label: 'Логи', icon: 'ScrollText' },
  { id: 'hack', label: 'Взлом', icon: 'Skull' },
];

const HELP: Record<string, string> = {
  help: 'Список доступных команд',
  whoami: 'Текущий пользователь сессии',
  scan: 'scan <ip> — сканировать порты узла',
  nmap: 'nmap <ip> — карта открытых портов',
  ping: 'ping <host> — проверка доступности',
  decrypt: 'decrypt <hash> — расшифровать хэш',
  exploit: 'exploit <target> — запустить эксплойт',
  crack: 'crack <user> — подбор пароля',
  ssh: 'ssh <ip> — подключение к удалённому узлу',
  clear: 'Очистить терминал',
};

const Index = () => {
  const [tab, setTab] = useState<Tab>('home');
  const [lines, setLines] = useState<Line[]>([
    { text: 'NEXUS OS v3.7.1 // несанкционированный доступ запрещён', type: 'sys' },
    { text: 'Введите "help" для списка команд.', type: 'sys' },
  ]);
  const [cmd, setCmd] = useState('');
  const [logs, setLogs] = useState<Line[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string[]>([]);
  const [hackProgress, setHackProgress] = useState(0);
  const [hacking, setHacking] = useState(false);
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
    print([{ text: `root@nexus:~$ ${input}`, type: 'in' }]);
    pushLog(`Команда: ${input}`);
    const [name, ...args] = input.split(' ');
    const arg = args.join(' ');

    switch (name.toLowerCase()) {
      case 'help':
        print(Object.entries(HELP).map(([k, v]) => ({ text: `  ${k.padEnd(10)} ${v}`, type: 'out' })));
        break;
      case 'whoami':
        print([{ text: 'root // uid=0 gid=0 clearance=OMEGA', type: 'ok' }]);
        break;
      case 'clear':
        setLines([]);
        return;
      case 'ping':
        print([
          { text: `PING ${arg || 'target'}: 64 bytes — время=12ms`, type: 'out' },
          { text: `PING ${arg || 'target'}: 64 bytes — время=11ms`, type: 'out' },
          { text: 'Узел доступен. Потеря пакетов 0%', type: 'ok' },
        ]);
        break;
      case 'scan':
      case 'nmap':
        print([
          { text: `Сканирование ${arg || '10.0.0.1'}...`, type: 'out' },
          { text: 'PORT 22/tcp   open   ssh', type: 'ok' },
          { text: 'PORT 80/tcp   open   http', type: 'ok' },
          { text: 'PORT 443/tcp  open   https', type: 'ok' },
          { text: 'PORT 3306/tcp open   mysql [УЯЗВИМ]', type: 'err' },
        ]);
        break;
      case 'decrypt':
        print([
          { text: `Расшифровка ${arg || 'hash'}...`, type: 'out' },
          { text: 'Алгоритм: SHA-256 → MD5 fallback', type: 'out' },
          { text: 'РЕЗУЛЬТАТ: ' + (arg ? 'p@ssw0rd_2099' : 'нет данных'), type: 'ok' },
        ]);
        break;
      case 'exploit':
        print([
          { text: `Загрузка эксплойта для ${arg || 'target'}...`, type: 'out' },
          { text: 'CVE-2099-1337 применён успешно', type: 'ok' },
          { text: 'Получен shell-доступ root@remote', type: 'ok' },
        ]);
        break;
      case 'crack':
        print([
          { text: `Подбор пароля для ${arg || 'admin'}...`, type: 'out' },
          { text: 'Перебор словаря: 14,892,331 комбинаций', type: 'out' },
          { text: 'НАЙДЕНО: ' + (arg || 'admin') + ':qwerty1990', type: 'ok' },
        ]);
        break;
      case 'ssh':
        print([
          { text: `Подключение к ${arg || '10.0.0.1'}...`, type: 'out' },
          { text: 'Обмен ключами RSA-4096... OK', type: 'ok' },
          { text: 'Туннель установлен. Соединение зашифровано.', type: 'ok' },
        ]);
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
    pushLog('Запущено сканирование подсети 192.168.0.0/24');
    const hosts = [
      '192.168.0.1   — Роутер [GATEWAY]',
      '192.168.0.14  — Сервер БД [22,80,3306]',
      '192.168.0.33  — Камера IoT [УЯЗВИМ]',
      '192.168.0.51  — Рабочая станция',
      '192.168.0.99  — Скрытый узел [???]',
    ];
    hosts.forEach((h, i) =>
      setTimeout(() => {
        setScanResult((r) => [...r, h]);
        if (i === hosts.length - 1) setScanning(false);
      }, (i + 1) * 700)
    );
  };

  const startHack = () => {
    if (hacking) return;
    setHacking(true);
    setHackProgress(0);
    pushLog('Инициирован взлом целевой системы');
    const interval = setInterval(() => {
      setHackProgress((p) => {
        const next = p + Math.random() * 12;
        if (next >= 100) {
          clearInterval(interval);
          setHacking(false);
          pushLog('ДОСТУП ПОЛУЧЕН: целевая система скомпрометирована');
          return 100;
        }
        return next;
      });
    }, 300);
  };

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
            <span className="font-display font-black tracking-widest text-lg text-primary text-glow">NEXUS</span>
            <span className="text-muted-foreground text-xs hidden sm:inline">// hacker terminal sim</span>
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
            <h1 className="font-display font-black text-4xl sm:text-6xl text-primary text-glow leading-none mb-2">
              ВЗЛОМАЙ
              <br />
              <span className="text-secondary text-glow-cyan">СИСТЕМУ</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mb-8 mt-4">
              Интерактивный симулятор хакера. Запускай команды терминала, сканируй сети,
              расшифровывай хэши и взламывай удалённые узлы — всё в безопасной песочнице.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
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
            <div className="mt-8 border border-border bg-card/60 p-4">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>UPTIME: 99.97%</span>
                <span>УЗЛОВ: 4096</span>
                <span className="text-primary">УГРОЗ: 0</span>
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
              <span className="ml-2">root@nexus — bash</span>
            </div>
            <div className="h-[55vh] overflow-y-auto p-4 text-sm leading-relaxed">
              {lines.map((l, i) => (
                <div key={i} className={lineColor(l.type)}>{l.text}</div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={onSubmit} className="flex items-center border-t border-border px-4 py-2">
              <span className="text-primary text-glow mr-2">root@nexus:~$</span>
              <input
                autoFocus
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground caret-primary"
                placeholder="введите команду..."
              />
              <span className="text-primary animate-blink">▋</span>
            </form>
          </div>
        )}

        {tab === 'scan' && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-primary text-glow">Сканер сети</h2>
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
                <p className="text-muted-foreground text-sm">Нажмите «Запустить скан», чтобы обнаружить узлы подсети.</p>
              )}
              {scanResult.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm animate-fade-in border-b border-border/40 pb-2">
                  <Icon name="Wifi" size={14} className="text-secondary" />
                  <span className={h.includes('УЯЗВИМ') || h.includes('???') ? 'text-destructive' : 'text-foreground'}>{h}</span>
                </div>
              ))}
              {scanning && <span className="text-primary text-sm animate-blink">▋ поиск активных хостов...</span>}
            </div>
          </div>
        )}

        {tab === 'logs' && (
          <div className="max-w-3xl">
            <h2 className="font-display font-bold text-xl text-primary text-glow mb-4">Системные логи</h2>
            <div className="border border-border bg-card/70 min-h-[40vh] p-4 text-sm space-y-1">
              {logs.length === 0 && <p className="text-muted-foreground">Журнал пуст. Активность появится здесь.</p>}
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
            <h2 className="font-display font-bold text-xl text-destructive mb-4">Модуль взлома</h2>
            <div className="border border-border bg-card/70 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="Crosshair" className="text-destructive" size={20} />
                <span className="text-foreground">Цель: <span className="text-secondary">central-mainframe.nexus</span></span>
              </div>
              <div className="h-4 border border-border bg-background mb-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 animate-glow-pulse"
                  style={{ width: `${hackProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-6">
                <span>{hacking ? 'Обход файрвола...' : hackProgress >= 100 ? 'СИСТЕМА ВЗЛОМАНА' : 'ожидание'}</span>
                <span className="text-primary">{Math.floor(hackProgress)}%</span>
              </div>
              {hackProgress >= 100 ? (
                <div className="text-primary text-glow text-center py-3 border border-primary animate-fade-in">
                  ✓ ДОСТУП ПОЛУЧЕН — ROOT
                </div>
              ) : (
                <button
                  onClick={startHack}
                  disabled={hacking}
                  className="w-full flex items-center justify-center gap-2 border border-destructive text-destructive py-3 hover:bg-destructive/10 disabled:opacity-50 transition-all font-display font-bold"
                >
                  <Icon name="Skull" size={18} />
                  {hacking ? 'ВЗЛОМ...' : 'НАЧАТЬ ВЗЛОМ'}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="container py-6 text-center text-xs text-muted-foreground relative z-10">
        NEXUS // симулятор в безопасной песочнице — реального вреда не наносит
      </footer>
    </div>
  );
};

export default Index;
