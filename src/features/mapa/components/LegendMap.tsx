import styles from "./LegendMap.module.css";

const LegendMap = () => {
    return(
        <article className={styles.legendContainer}>
                <h3 className={styles.legendTitle}>Palmas</h3>
                
                <section className={styles.legendRow}>
                    <span className={`${styles.indicator} ${styles.palmaRevisada}`} />
                    <span className={styles.legendText}>Revisadas</span>
                </section>

                <section className={styles.legendRow}>
                    <span className={`${styles.indicator} ${styles.palmaMarcada}`} />
                    <span className={styles.legendText}>Marcadas</span>
                </section>
            </article>
    );
}

export default LegendMap;