import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import SectionHeader from '../../components/ui/SectionHeader';
import Accordion from '../../components/ui/Accordion';
import TextAreaField from '../../components/ui/TextAreaField';
import Button from '../../components/ui/Button';

const LogDisplay: React.FC<{ logs: string[] }> = ({ logs }) => {
    if (logs.length === 0) {
        return <p className="text-gray-500 italic px-4">Không có dữ liệu.</p>;
    }

    return (
        <div className="space-y-3">
            {logs.map((log, index) => (
                <div key={index} className="bg-gray-800/60 rounded-lg border border-gray-700/70">
                    <pre className="text-gray-200 text-sm whitespace-pre-wrap break-words font-mono p-3">
                        <code>{log}</code>
                    </pre>
                </div>
            ))}
        </div>
    );
};

const ManualTagProcessor: React.FC = () => {
    const { handleProcessDebugTags, isLoading } = useGameStore(state => ({
        handleProcessDebugTags: state.handleProcessDebugTags,
        isLoading: state.isLoading
    }));
    const [narration, setNarration] = useState('');
    const [tags, setTags] = useState('');

    const handleProcessClick = () => {
        if (narration.trim() || tags.trim()) {
            handleProcessDebugTags(narration, tags);
        }
    };

    return (
        <div className="space-y-4">
            <TextAreaField
                id="debugNarration"
                label="Lời kể / Tường thuật (Tùy chọn)"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Nhập một đoạn tường thuật sẽ được thêm vào nhật ký game..."
                rows={3}
            />
            <TextAreaField
                id="debugTags"
                label="Tags Hệ Thống (Mỗi tag một dòng)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="[STATS_UPDATE: currency=+=100]&#10;[ITEM_ACQUIRED: name=&quot;Thần Kiếm&quot; ...]"
                rows={5}
            />
            <Button
                onClick={handleProcessClick}
                isLoading={isLoading}
                disabled={isLoading || (!narration.trim() && !tags.trim())}
                loadingText="Đang xử lý..."
                className="w-full justify-center bg-green-700 hover:bg-green-600 disabled:bg-gray-600"
            >
                Xử lý Tags
            </Button>
        </div>
    );
};

const DebugPanel: React.FC = () => {
    const {
        debugRetrievedContextLog,
        debugSentPromptsLog,
        debugRawResponsesLog,
    } = useGameStore(state => ({
        debugRetrievedContextLog: state.debugRetrievedContextLog,
        debugSentPromptsLog: state.debugSentPromptsLog,
        debugRawResponsesLog: state.debugRawResponsesLog,
    }));

    return (
        <div className="h-full overflow-y-auto space-y-4 pr-2">
            <SectionHeader title="Thông Tin Gỡ Lỗi" />
            
             <p className='text-gray-400 text-sm -mt-2'>
                Các công cụ và nhật ký giúp bạn hiểu rõ hơn về "suy nghĩ" của AI và thao tác trực tiếp với trạng thái game.
            </p>
            
            <Accordion title="Xử lý Tags Thủ Công" count={0}>
                <ManualTagProcessor />
            </Accordion>

            <Accordion title="Context Truy Xuất (RAG)" count={debugRetrievedContextLog.length}>
                <LogDisplay logs={debugRetrievedContextLog} />
            </Accordion>

            <Accordion title="Prompt Đã Gửi Tới AI" count={debugSentPromptsLog.length}>
                <LogDisplay logs={debugSentPromptsLog} />
            </Accordion>
            
            <Accordion title="Phản Hồi Thô Từ AI" count={debugRawResponsesLog.length}>
                <LogDisplay logs={debugRawResponsesLog} />
            </Accordion>
        </div>
    );
};

export default DebugPanel;