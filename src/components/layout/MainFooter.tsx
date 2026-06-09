import { KoFiButton } from "@/components/layout/KoFiButton";

const currentYear = new Date().getFullYear();

export function MainFooter() {
  return (
    <footer className="border-t border-border-subtle/70 bg-surface-base">
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 text-sm text-text-secondary md:grid-cols-[1fr_auto] md:items-start">
        <div className="space-y-2">
          <p className="font-display text-lg font-semibold text-text-primary">XIVSpots</p>
          <p className="max-w-2xl leading-6">
            A community-made index for scenic screenshots, quiet overlooks, and favorite places across Eorzea.
          </p>
          <p className="text-xs leading-5 text-text-muted">
            XIVSpots is an unofficial fan project and is not affiliated with, endorsed by, or sponsored by Square Enix.
            FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd. &copy; SQUARE ENIX. Fan content is
            used under the{" "}
            <a
              href="https://support.na.square-enix.com/rule.php?id=5382&la=1&tag=authc"
              className="font-semibold text-brand-spark hover:text-text-primary"
            >
              FINAL FANTASY XIV Materials Usage License
            </a>
            .
          </p>
        </div>
        <div className="space-y-2 md:text-right">
          <p className="text-xs uppercase tracking-wide text-text-muted">Project</p>
          <p className="text-text-primary">&copy; {currentYear} sorkos.net</p>
          <KoFiButton />
        </div>
      </div>
    </footer>
  );
}
