import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullScreenPanel } from "@/components/common/FullScreenPanel";
import type { Provider, CustomEndpoint } from "@/types";
import type { AppId } from "@/lib/api";
import {
  ProviderForm,
  type ProviderFormValues,
} from "@/components/providers/forms/ProviderForm";

interface AddProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: AppId;
  onSubmit: (
    provider: Omit<Provider, "id"> & { providerKey?: string },
  ) => Promise<void> | void;
}

export function AddProviderDialog({
  open,
  onOpenChange,
  appId,
  onSubmit,
}: AddProviderDialogProps) {
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    async (values: ProviderFormValues) => {
      const parsedConfig = JSON.parse(values.settingsConfig) as Record<
        string,
        unknown
      >;

      const providerData: Omit<Provider, "id"> & { providerKey?: string } = {
        name: values.name.trim(),
        notes: values.notes?.trim() || undefined,
        websiteUrl: values.websiteUrl?.trim() || undefined,
        settingsConfig: parsedConfig,
        icon: values.icon?.trim() || undefined,
        iconColor: values.iconColor?.trim() || undefined,
        ...(values.meta ? { meta: values.meta } : {}),
      };

      // OpenCode: pass providerKey for ID generation
      if (appId === "opencode" && values.providerKey) {
        providerData.providerKey = values.providerKey;
      }

      // Collect endpoint candidates from config
      const hasCustomEndpoints =
        providerData.meta?.custom_endpoints &&
        Object.keys(providerData.meta.custom_endpoints).length > 0;

      if (!hasCustomEndpoints) {
        const urlSet = new Set<string>();
        const addUrl = (rawUrl?: string) => {
          const url = (rawUrl || "").trim().replace(/\/+$/, "");
          if (url && url.startsWith("http")) {
            urlSet.add(url);
          }
        };

        if (appId === "claude") {
          const env = parsedConfig.env as Record<string, any> | undefined;
          if (env?.ANTHROPIC_BASE_URL) addUrl(env.ANTHROPIC_BASE_URL);
        } else if (appId === "codex") {
          const config = parsedConfig.config as string | undefined;
          if (config) {
            const baseUrlMatch = config.match(/base_url\s*=\s*["']([^"']+)["']/);
            if (baseUrlMatch?.[1]) addUrl(baseUrlMatch[1]);
          }
        } else if (appId === "gemini") {
          const env = parsedConfig.env as Record<string, any> | undefined;
          if (env?.GOOGLE_GEMINI_BASE_URL) addUrl(env.GOOGLE_GEMINI_BASE_URL);
        } else if (appId === "opencode") {
          const options = parsedConfig.options as Record<string, any> | undefined;
          if (options?.baseURL) addUrl(options.baseURL);
        }

        const urls = Array.from(urlSet);
        if (urls.length > 0) {
          const now = Date.now();
          const customEndpoints: Record<string, CustomEndpoint> = {};
          urls.forEach((url) => {
            customEndpoints[url] = { url, addedAt: now, lastUsed: undefined };
          });
          providerData.meta = {
            ...(providerData.meta ?? {}),
            custom_endpoints: customEndpoints,
          };
        }
      }

      await onSubmit(providerData);
      onOpenChange(false);
    },
    [appId, onSubmit, onOpenChange],
  );

  const footer = (
    <>
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        className="border-border/20 hover:bg-accent hover:text-accent-foreground"
      >
        {t("common.cancel")}
      </Button>
      <Button
        type="submit"
        form="provider-form"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("common.add")}
      </Button>
    </>
  );

  return (
    <FullScreenPanel
      isOpen={open}
      title={t("provider.addNewProvider")}
      onClose={() => onOpenChange(false)}
      footer={footer}
    >
      <ProviderForm
        appId={appId}
        submitLabel={t("common.add")}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        showButtons={false}
      />
    </FullScreenPanel>
  );
}
