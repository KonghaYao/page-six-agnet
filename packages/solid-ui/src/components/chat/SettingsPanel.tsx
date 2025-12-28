import { createSignal, Show } from 'solid-js';
import { X, Save, Globe, Bot, Shield } from 'lucide-solid';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsPanel = (props: SettingsPanelProps) => {
    const [apiUrl, setApiUrl] = createSignal('http://localhost:8123');
    const [defaultAgent, setDefaultAgent] = createSignal('');
    const [withCredentials, setWithCredentials] = createSignal(false);

    const handleSave = () => {
        const settings = {
            apiUrl: apiUrl(),
            defaultAgent: defaultAgent(),
            withCredentials: withCredentials(),
        };
        localStorage.setItem('chat-settings', JSON.stringify(settings));
        props.onClose();
    };

    const loadSettings = () => {
        try {
            const saved = localStorage.getItem('chat-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                setApiUrl(settings.apiUrl || 'http://localhost:8123');
                setDefaultAgent(settings.defaultAgent || '');
                setWithCredentials(settings.withCredentials || false);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    loadSettings();

    return (
        <Show when={props.isOpen}>
            <div class="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200">
                <div
                    class="bg-white rounded-2xl w-full max-w-[360px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                        <h3 class="m-0 text-sm font-bold text-gray-900 uppercase tracking-tight">Settings</h3>
                        <button
                            class="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={props.onClose}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div class="p-6 space-y-6 overflow-y-auto max-h-[400px]">
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <div class="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <Globe size={14} />
                                    API Endpoint
                                </div>
                                <input
                                    type="text"
                                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    value={apiUrl()}
                                    onInput={(e) => setApiUrl(e.currentTarget.value)}
                                    placeholder="http://localhost:8123"
                                />
                            </div>

                            <div class="space-y-2">
                                <div class="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <Bot size={14} />
                                    Default Agent
                                </div>
                                <input
                                    type="text"
                                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    value={defaultAgent()}
                                    onInput={(e) => setDefaultAgent(e.currentTarget.value)}
                                    placeholder="e.g. browsing-agent"
                                />
                            </div>

                            <div class="pt-2">
                                <label class="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer group hover:bg-gray-100 transition-colors">
                                    <div class="flex items-center gap-2 text-xs font-bold text-gray-600">
                                        <Shield size={14} />
                                        With Credentials
                                    </div>
                                    <input
                                        type="checkbox"
                                        class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={withCredentials()}
                                        onChange={(e) => setWithCredentials(e.currentTarget.checked)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-gray-50/80 border-t border-gray-100 flex gap-2">
                        <button
                            class="flex-1 py-2 px-4 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold transition-all hover:bg-gray-100"
                            onClick={props.onClose}
                        >
                            Cancel
                        </button>
                        <button
                            class="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-200"
                            onClick={handleSave}
                        >
                            <Save size={16} />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </Show>
    );
};
