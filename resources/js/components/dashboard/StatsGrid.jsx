import React from 'react';

export default function StatsGrid({ stats }) {
    return (
                    <section className="stats-grid">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <article className="stat-card" key={stat.label}>
                                    <div className="stat-top">
                                        <span className="stat-label">{stat.label}</span>
                                        <span className="stat-icon"><Icon size={19} /></span>
                                    </div>
                                    <div className="stat-value">{stat.value}</div>
                                    <div className="stat-note">{stat.note}</div>
                                </article>
                            );
                        })}
                    </section>
    );
}
