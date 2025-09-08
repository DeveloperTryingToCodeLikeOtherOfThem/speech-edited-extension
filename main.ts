// adapted from https://github.com/riknoll/arcade-story/message.ts
namespace speech {
     export enum Volume {
      Quiet = 20,
      Normal = 100, 
      Loud = 200
     }

     export enum Speed {
         Slow = 200,
         Normal = 100,
         Fast = 50
     }

    const defaultTick = new music.Melody("@20,10,0,0 c5:1-150");

    export class Speech {
        private bubble: Image;
        private sprite: Sprite;
        private message: string;
        private currentIndex: number;
        private interval: number;
        private maxCharsPerLine: number;
        private maxLines: number;
        private intervalHandle: number;
        public soundEnabled: boolean;
        private tickSound: music.Melody;

        constructor(intervalMs: Speed = Speed.Normal) {
            this.bubble = image.create(160, 60);
            this.bubble.fill(0);
            this.sprite = sprites.create(this.bubble);
            this.message = "";
            this.currentIndex = 0;
            this.interval = intervalMs;
            this.maxCharsPerLine = 26;
            this.maxLines = 3;
            this.intervalHandle = 0;
            this.soundEnabled = true;
            this.tickSound = defaultTick;
        }

        private wrapText(message: string): string[] {
            const words = message.split(" ");
            const lines: string[] = [];
            let currentLine = "";

            for (let w of words) {
                if ((currentLine + (currentLine ? " " : "") + w).length > this.maxCharsPerLine) {
                    lines.push(currentLine);
                    currentLine = w;
                } else {
                    currentLine += (currentLine ? " " : "") + w;
                }
            }
            if (currentLine) lines.push(currentLine);
            return lines;
        }

        private stopInterval() {
            if (this.intervalHandle) {
                clearInterval(this.intervalHandle);
                this.intervalHandle = 0;
            }
        }

        public printDialog(message: string, speed: Volume) {
            this.update(message, speed);
        }

        private running: boolean = false;

        protected update(message: string, speed: Volume) {
            this.running = true;
            this.currentIndex = 0;
            this.message = message;

            game.onUpdateInterval(this.interval, () => {
                if (!this.running) return;

                if (this.currentIndex < this.message.length) {
                    // 1️⃣ Slice message up to currentIndex for typewriter effect
                    const partial = this.message.slice(0, this.currentIndex + 1);

                    // 2️⃣ Wrap words into lines
                    const lines = this.wrapText(partial);

                    // 3️⃣ Only keep last maxLines for scrolling effect
                    const visibleLines = lines.length > this.maxLines ? lines.slice(lines.length - this.maxLines) : lines;

                    // 4️⃣ Clear and redraw bubble background
                    this.bubble.fill(0);                      // clear bubble
                    this.bubble.fillRect(0, 0, 160, 60, 1);  // background color

                    // 5️⃣ Draw each visible line
                    for (let i = 0; i < visibleLines.length; i++) {
                        this.bubble.print(visibleLines[i], 4, 4 + i * 16, 15); // letter color
                    }

                    // 6️⃣ Update sprite image
                    this.sprite.setImage(this.bubble);

                    // 7️⃣ Play tick sound per letter
                    if (this.soundEnabled) {
                    this.playWithVolume(defaultTick, speed)
                    }

                    // 8️⃣ Move to next letter
                    this.currentIndex++;
                } else {
                    // 9️⃣ Stop updating when finished
                    this.running = false;
                }

                if(!this.running) {
                    this.clearBubble()
                }
            });
        }


        clearBubble() {
            this.bubble.fill(0)
        }
 
        // optional: change bubble color
        public setBubbleColor(color: number) {
            this.bubble.fillRect(0, 0, 160, 60, color);
        }

        // optional: change letter color dynamically
        public setLetterColor(color: number) {
            const partial = this.message.slice(0, this.currentIndex);
            const lines = this.wrapText(partial);
            const visibleLines = lines.length > this.maxLines ? lines.slice(lines.length - this.maxLines) : lines;

            this.bubble.fill(0);
            this.bubble.fillRect(0, 0, 160, 60, 1);
            for (let i = 0; i < visibleLines.length; i++) {
                this.bubble.print(visibleLines[i], 4, 4 + i * 16, color);
            }
            this.sprite.setImage(this.bubble);
        }

        playWithVolume(sound: music.Melody, volume: number) {
            if (!this._currentCutscene().soundEnabled) return;
            sound.play(volume);
        }
        
        _currentCutscene() {
            let stateStack: Speech[];

            if (!stateStack) {
                stateStack = [];

                game.addScenePushHandler(() => {
                    stateStack.push(new Speech());
                });

                game.addScenePopHandler(() => {
                    if (stateStack.length) {
                        stateStack[stateStack.length - 1].cancel();
                        stateStack.pop();
                    }
                });
            }
            if (!stateStack.length) {
                stateStack.push(new Speech());
            }
            return stateStack[stateStack.length - 1];
        }
       
        currentTask: Task

        cancel() {
            // if (isMenuOpen()) {
            //     closeMenu();
            // }
            // if (this.currentTask && this.currentTask.cancel) {
            //     this.currentTask.cancel();
            //     this.currentTask = null;
            // }
            // if (this.state === State.Running) {
            //     this.state = State.Cancelled;
            // }
        }

    }
}

function isMenuOpen(): boolean {
    return false
}

// Example usage:
const printText = new speech.Speech();
printText.printDialog("Hello world! This prints like a typewriter and wraps words properly. It scrolls if the text exceeds the bubble height, and plays a nice tick sound per letter.", speech.Volume.Loud);

interface Task {
    isDone(): boolean;
    key?: string;
    cancel?: () => void;
}

 