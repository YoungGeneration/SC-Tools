import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Server, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScApiPanel() {
  const { t } = useTranslation();
  const [serverUrl, setServerUrl] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [connected, setConnected] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch(`${serverUrl.replace(/\/+$/, "")}/health`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      setConnected(res.ok);
    } catch {
      setConnected(false);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Server className="h-5 w-5" />
          <h3 className="text-lg font-medium">
            {t("scapi.connection", { defaultValue: "SC-API 连接配置" })}
          </h3>
          {connected ? (
            <Wifi className="h-4 w-4 text-green-500 ml-auto" />
          ) : (
            <WifiOff className="h-4 w-4 text-muted-foreground ml-auto" />
          )}
        </div>

        <div className="space-y-2">
          <Label>{t("scapi.serverUrl", { defaultValue: "服务器地址" })}</Label>
          <Input
            placeholder="https://api.example.com"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("scapi.adminKey", { defaultValue: "管理员密钥" })}</Label>
          <Input
            type="password"
            placeholder="sk-admin-..."
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
        </div>

        <Button onClick={handleTestConnection} disabled={testing || !serverUrl}>
          {testing
            ? t("scapi.testing", { defaultValue: "测试中..." })
            : t("scapi.testConnection", { defaultValue: "测试连接" })}
        </Button>
      </div>

      {connected && (
        <div className="glass rounded-xl p-6 border border-white/10 space-y-4">
          <h3 className="text-lg font-medium">
            {t("scapi.dashboard", { defaultValue: "仪表板" })}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-white/10 p-4 text-center">
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">
                {t("scapi.activeUsers", { defaultValue: "活跃用户" })}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 p-4 text-center">
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">
                {t("scapi.totalRequests", { defaultValue: "总请求数" })}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 p-4 text-center">
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">
                {t("scapi.upstreamAccounts", { defaultValue: "上游账号" })}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic">
            {t("scapi.comingSoon", {
              defaultValue: "完整功能将在 SC-API 服务开发后启用",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
