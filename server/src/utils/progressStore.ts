import { randomUUID } from 'node:crypto';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DownloadJob {
    id: string;
    status: JobStatus;
    progress: number;
    stage: string;
    filePath?: string;
    filename?: string;
    error?: string;
    createdAt: number;
}

class DownloadJobStore {
    private jobs: Map<string, DownloadJob> = new Map();
    private readonly TTL = 1000 * 60 * 30; // 30 minutes

    constructor() {
        // Cleanup old jobs periodically
        setInterval(() => this.cleanup(), 1000 * 60 * 5); // Every 5 mins
    }

    createJob(): string {
        const id = randomUUID();
        this.jobs.set(id, {
            id,
            status: 'pending',
            progress: 0,
            stage: 'Initializing...',
            createdAt: Date.now()
        });
        return id;
    }

    updateJob(id: string, updates: Partial<Omit<DownloadJob, 'id' | 'createdAt'>>) {
        const job = this.jobs.get(id);
        if (job) {
            this.jobs.set(id, { ...job, ...updates });
        }
    }

    getJob(id: string): DownloadJob | undefined {
        return this.jobs.get(id);
    }

    cleanup() {
        const now = Date.now();
        for (const [id, job] of this.jobs.entries()) {
            if (now - job.createdAt > this.TTL) {
                this.jobs.delete(id);
            }
        }
    }
}

export const downloadJobStore = new DownloadJobStore();
