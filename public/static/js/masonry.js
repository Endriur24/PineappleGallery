class MasonryLayout {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            throw new Error(`Container not found: ${containerSelector}`);
        }

        this.options = {
            gap: options.gap || 16,
            minColumnWidth: options.minColumnWidth || 300,
            ...options
        };

        this.resizeEventDispatched = false; // Add flag to track resize event dispatch

        this.init();
    }

    init() {
        this.container.style.position = 'relative';
        this.items = Array.from(this.container.querySelectorAll('.masonry-item')).map(element => {
            const link = element.querySelector('a');
            const width = parseInt(link.dataset.pswpWidth, 10);
            const height = parseInt(link.dataset.pswpHeight, 10);
            const aspectRatio = width / height;

            // Set initial aspect ratio
            const content = element.querySelector('.masonry-item-content');
            content.style.paddingBottom = `${(height / width) * 100}%`;
            content.style.maxHeight = `${(height / width) * 100}%`;

            // Handle image load
            const img = element.querySelector('img');
            if (img.complete) {
                this.handleImageLoad(img, element);
            } else {
                img.onload = () => this.handleImageLoad(img, element);
            }

            return { element, aspectRatio };
        });

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        //console.log("resize event listener added");
        this.layout();
    }

    handleImageLoad(img, element) {
        img.classList.add('loaded');
        const placeholder = element.querySelector('.placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        element.querySelector('.masonry-item-content').style.paddingBottom = '';
    }

    calculateColumns() {
        const containerWidth = this.container.offsetWidth;
        const columnCount = Math.max(1, Math.floor(containerWidth / this.options.minColumnWidth));
        const columnWidth = (containerWidth - (this.options.gap * (columnCount - 1))) / columnCount;
        return { count: columnCount, width: columnWidth };
    }

    layout(isResizeEvent = false) {
        //console.log(`layout called with isResizeEvent: ${isResizeEvent}`);
        const { count: columnCount, width: columnWidth } = this.calculateColumns();
        const columns = Array(columnCount).fill().map(() => ({
            height: 0,
            items: []
        }));

        this.items.forEach((item) => {
            const shortestColumn = columns.reduce((minCol, col, index) => 
                col.height < columns[minCol].height ? index : minCol
            , 0);

            const itemHeight = columnWidth / item.aspectRatio;
            columns[shortestColumn].items.push({
                element: item.element,
                height: itemHeight
            });
            columns[shortestColumn].height += itemHeight + this.options.gap;
        });

        columns.forEach((column, columnIndex) => {
            let yOffset = 0;
            column.items.forEach((item) => {
                const xOffset = columnIndex * (columnWidth + this.options.gap);
                item.element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
                item.element.style.width = `${columnWidth}px`;
                item.element.classList.add('after-layout');
                yOffset += item.height + this.options.gap;
            });
        });

        const maxHeight = Math.max(...columns.map(col => col.height)) - this.options.gap;
        this.container.style.height = `${maxHeight}px`;

        // Dispatch resize event only if not already dispatched
        if (!this.resizeEventDispatched) {
            window.dispatchEvent(new Event('resize'));
            //console.log("resize event dispatched");
            this.resizeEventDispatched = true; // Set flag to true

            // Reset flag after 500ms
            setTimeout(() => {
                this.resizeEventDispatched = false;
            }, 100);
        }
    }

    handleResize() {
        //console.log("handleResize called");
        requestAnimationFrame(() => this.layout(true));
    }

    // Optional: Method to manually trigger layout with resize event
    refresh() {
        this.layout(false);
    }

    // Optional: Cleanup method
    destroy() {
        window.removeEventListener('resize', this.handleResize);
    }
}

// Initialize the masonry layout
const masonry = new MasonryLayout('#masonry-container', {
    gap: 16,
    minColumnWidth: 200
});

// Fix images overlapping incorrectly for mobile devices (specificially iOS Safari)
const container = document.querySelector("#masonry-container");
imagesLoaded(container).on('progress', function(){
    if (masonry !== null)
        masonry.layout();
});
