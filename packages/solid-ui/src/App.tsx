import { MagicChat } from './components/chat';
import { Gateway } from './components/gateway';
import { ChatProvider } from '@langgraph-js/sdk/solid';

function App() {
    return (
        <div class="h-screen w-full relative bg-gray-50">
            {/* Main Content: Gateway System */}
            <Gateway />

            {/* Magic AI Assistant (Bottom Centered) */}

            <MagicChat />
        </div>
    );
}

export default App;
