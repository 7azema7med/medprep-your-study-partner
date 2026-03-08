import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useExamStore } from "@/stores/exam-store";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function SettingsDialog() {
  const { activeDialog, setActiveDialog, settings, updateSettings } = useExamStore();
  const open = activeDialog === "settings";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setActiveDialog(null)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Exam Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Font Size</Label>
            <Select value={settings.fontSize} onValueChange={(v) => updateSettings({ fontSize: v as any })}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Line Spacing</Label>
            <Select value={settings.lineSpacing} onValueChange={(v) => updateSettings({ lineSpacing: v as any })}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="relaxed">Relaxed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Show Timer</Label>
            <Switch checked={settings.showTimer} onCheckedChange={(v) => updateSettings({ showTimer: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Confirm Before Submit</Label>
            <Switch checked={settings.confirmBeforeSubmit} onCheckedChange={(v) => updateSettings({ confirmBeforeSubmit: v })} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
