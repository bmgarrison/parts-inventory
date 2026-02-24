<script lang="ts">
	import { parts } from '$lib/data';
	import type { Part } from '$lib/types';
	import { page } from '$app/stores';

	let searchQuery = '';
	let selectedSeries = '';
	let selectedPartType = '';
	let selectedCondition = '';
	let selectedTags: string[] = [];
	let sortBy = 'newest';
	let showSortMenu = false;
	let showSeriesMenu = false;
	let showPartTypeMenu = false;
	let showConditionMenu = false;

	const sortOptions = [
		{ value: 'newest', label: 'Newest First' },
		{ value: 'price-low', label: 'Price: Low to High' },
		{ value: 'price-high', label: 'Price: High to Low' },
		{ value: 'mileage-low', label: 'Mileage: Low to High' },
		{ value: 'mileage-high', label: 'Mileage: High to Low' },
		{ value: 'name', label: 'Name: A to Z' }
	];

	// Honda-specific filter categories
	$: engineSeries = ['B-Series', 'D-Series', 'K-Series', 'F-Series', 'H-Series', 'J-Series'];
	$: partTypes = ['Engine', 'Transmission', 'ECU/Electronics', 'Intake', 'Exhaust', 'Suspension', 'Wheels', 'Interior'];
	$: conditions = [...new Set(parts.map(p => p.condition))];

	// React to URL parameter changes
	$: {
		const params = $page.url.searchParams;
		searchQuery = params.get('search') || '';
		selectedSeries = params.get('series') || '';
		selectedPartType = params.get('type') || '';
		selectedCondition = params.get('condition') || '';
		sortBy = params.get('sort') || 'newest';
		const tagsParam = params.get('tags');
		selectedTags = tagsParam ? tagsParam.split(',') : [];
	}

	$: filteredParts = parts.filter(part => {
		const matchesSearch = searchQuery === '' || 
			part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			part.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
			part.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
		
		// Match engine series from tags or name
		const matchesSeries = selectedSeries === '' || 
			part.tags.some(tag => tag.toLowerCase().includes(selectedSeries.toLowerCase().replace('-series', ''))) ||
			part.name.toLowerCase().includes(selectedSeries.toLowerCase());
		
		const matchesPartType = selectedPartType === '' || 
			part.category === selectedPartType ||
			(selectedPartType === 'ECU/Electronics' && part.category === 'Electronics');
		
		const matchesCondition = selectedCondition === '' || part.condition === selectedCondition;

		// Match all selected tags (AND logic)
		const matchesTags = selectedTags.length === 0 || 
			selectedTags.every(selectedTag => 
				part.tags.some(partTag => partTag.toLowerCase() === selectedTag.toLowerCase())
			);

		return matchesSearch && matchesSeries && matchesPartType && matchesCondition && matchesTags;
	});

	$: sortedParts = [...filteredParts].sort((a, b) => {
		switch (sortBy) {
			case 'price-low':
				return a.price - b.price;
			case 'price-high':
				return b.price - a.price;
			case 'mileage-low':
				return a.mileage - b.mileage;
			case 'mileage-high':
				return b.mileage - a.mileage;
			case 'name':
				return a.name.localeCompare(b.name);
			case 'newest':
			default:
				return 0; // Keep original order (newest first)
		}
	});

	// Update URL when filters change from user input
	function updateURL() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (selectedSeries) params.set('series', selectedSeries);
		if (selectedPartType) params.set('type', selectedPartType);
		if (selectedCondition) params.set('condition', selectedCondition);
		if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
		if (sortBy !== 'newest') params.set('sort', sortBy);
		
		const newUrl = params.toString() ? `/?${params.toString()}` : '/';
		window.history.pushState({}, '', newUrl);
	}

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter(t => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
		updateURL();
	}

	function removeTag(tag: string) {
		selectedTags = selectedTags.filter(t => t !== tag);
		updateURL();
	}

	function selectSort(value: string) {
		sortBy = value;
		showSortMenu = false;
		updateURL();
	}

	function selectSeries(value: string) {
		selectedSeries = value;
		showSeriesMenu = false;
		updateURL();
	}

	function selectPartType(value: string) {
		selectedPartType = value;
		showPartTypeMenu = false;
		updateURL();
	}

	function selectCondition(value: string) {
		selectedCondition = value;
		showConditionMenu = false;
		updateURL();
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.custom-dropdown')) {
			showSortMenu = false;
			showSeriesMenu = false;
			showPartTypeMenu = false;
			showConditionMenu = false;
		}
	}

</script>

<svelte:window on:click={handleClickOutside} />

<svelte:head>
	<title>Primo Parts Garage - Honda Performance Parts</title>
</svelte:head>

<div class="container">
	<header>
		<div class="logo-container">
			<img src="/primo-logo.svg" alt="Primo Parts Garage" class="logo" />
		</div>
		<h1>Primo Parts Garage</h1>
		<p>Quality used Honda performance parts at great prices</p>
	</header>

	<div class="filters">
		<div class="search-wrapper">
			<span class="search-icon">🔍</span>
			<input 
				type="text" 
				placeholder="SEARCH: ENGINE CODES, PART NUMBERS, TAGS..." 
				bind:value={searchQuery}
				on:input={updateURL}
				class="search-input"
			/>
		</div>
		
		{#if selectedTags.length > 0}
			<div class="active-tags">
				<span class="active-tags-label">Active Tags:</span>
				{#each selectedTags as tag}
					<button class="active-tag" on:click={() => removeTag(tag)}>
						{tag}
						<span class="remove-icon">×</span>
					</button>
				{/each}
			</div>
		{/if}
		
		<div class="filter-row">
			<!-- Engine Series Dropdown -->
			<div class="custom-dropdown">
				<button 
					class="dropdown-button" 
					on:click|stopPropagation={() => showSeriesMenu = !showSeriesMenu}
				>
					{selectedSeries || 'All Engine Series'}
					<span class="arrow">▼</span>
				</button>
				{#if showSeriesMenu}
					<div class="dropdown-menu">
						<button 
							class="dropdown-option {selectedSeries === '' ? 'active' : ''}"
							on:click={() => selectSeries('')}
						>
							{#if selectedSeries === ''}
								<span class="check">✓</span>
							{/if}
							All Engine Series
						</button>
						{#each engineSeries as series}
							<button 
								class="dropdown-option {selectedSeries === series ? 'active' : ''}"
								on:click={() => selectSeries(series)}
							>
								{#if selectedSeries === series}
									<span class="check">✓</span>
								{/if}
								{series}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Part Type Dropdown -->
			<div class="custom-dropdown">
				<button 
					class="dropdown-button" 
					on:click|stopPropagation={() => showPartTypeMenu = !showPartTypeMenu}
				>
					{selectedPartType || 'All Part Types'}
					<span class="arrow">▼</span>
				</button>
				{#if showPartTypeMenu}
					<div class="dropdown-menu">
						<button 
							class="dropdown-option {selectedPartType === '' ? 'active' : ''}"
							on:click={() => selectPartType('')}
						>
							{#if selectedPartType === ''}
								<span class="check">✓</span>
							{/if}
							All Part Types
						</button>
						{#each partTypes as type}
							<button 
								class="dropdown-option {selectedPartType === type ? 'active' : ''}"
								on:click={() => selectPartType(type)}
							>
								{#if selectedPartType === type}
									<span class="check">✓</span>
								{/if}
								{type}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Condition Dropdown -->
			<div class="custom-dropdown">
				<button 
					class="dropdown-button" 
					on:click|stopPropagation={() => showConditionMenu = !showConditionMenu}
				>
					{selectedCondition || 'All Conditions'}
					<span class="arrow">▼</span>
				</button>
				{#if showConditionMenu}
					<div class="dropdown-menu">
						<button 
							class="dropdown-option {selectedCondition === '' ? 'active' : ''}"
							on:click={() => selectCondition('')}
						>
							{#if selectedCondition === ''}
								<span class="check">✓</span>
							{/if}
							All Conditions
						</button>
						{#each conditions as condition}
							<button 
								class="dropdown-option {selectedCondition === condition ? 'active' : ''}"
								on:click={() => selectCondition(condition)}
							>
								{#if selectedCondition === condition}
									<span class="check">✓</span>
								{/if}
								{condition}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="results-count">
		<span class="count-text">{filteredParts.length} {filteredParts.length === 1 ? 'part' : 'parts'} found</span>
		<div class="sort-dropdown">
			<button 
				class="sort-button" 
				on:click|stopPropagation={() => showSortMenu = !showSortMenu}
			>
				{sortOptions.find(opt => opt.value === sortBy)?.label || 'Newest First'}
				<span class="arrow">▼</span>
			</button>
			{#if showSortMenu}
				<div class="sort-menu">
					{#each sortOptions as option}
						<button 
							class="sort-option {sortBy === option.value ? 'active' : ''}"
							on:click={() => selectSort(option.value)}
						>
							{#if sortBy === option.value}
								<span class="check">✓</span>
							{/if}
							{option.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="parts-grid">
		{#each sortedParts as part (part.id)}
			<a href="/parts/{part.id}" class="part-card">
				<div class="part-image">
					{#if part.image}
						<img src={part.image} alt={part.name} />
					{:else}
						<div class="no-image">
							<div class="no-image-text">
								<span class="primo-badge">PRIMO</span>
								<span class="no-img-label">NO IMAGE</span>
								<span class="available-label">AVAILABLE</span>
							</div>
						</div>
					{/if}
				</div>
				<div class="part-content">
					<h3>{part.name}</h3>
					<p class="price">${part.price}</p>
					<p class="description">{part.shortDescription}</p>
					<div class="meta">
						<span class="badge">{part.model}</span>
						<span class="badge">{part.year}</span>
						<span class="badge">{part.mileage.toLocaleString()} mi</span>
						<span class="badge condition-{part.condition.toLowerCase()}">{part.condition}</span>
						{#each part.tags.slice(0, 2) as tag}
							<button class="badge tag-link" on:click|preventDefault={() => toggleTag(tag)}>{tag}</button>
						{/each}
					</div>
				</div>
			</a>
		{/each}
	</div>

	{#if filteredParts.length === 0}
		<div class="no-results">
			<p>No parts found matching your criteria.</p>
			<button on:click={() => { searchQuery = ''; selectedSeries = ''; selectedPartType = ''; selectedCondition = ''; selectedTags = []; updateURL(); }}>
				Clear Filters
			</button>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', Arial, sans-serif;
		background: #1a1a1a url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23222222' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		color: #e0e0e0;
		animation: bgScroll 60s linear infinite;
	}

	@keyframes bgScroll {
		0% { background-position: 0 0; }
		100% { background-position: 60px 60px; }
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}

	header {
		text-align: center;
		padding: 2rem 0;
		background: linear-gradient(180deg, #cc0000 0%, #990000 100%);
		margin: -1rem -1rem 2rem;
		box-shadow: 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
		border-bottom: 3px solid #ff3333;
		border-top: 2px solid #ff6666;
		position: relative;
		overflow: hidden;
	}

	header::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
		animation: shine 3s infinite;
	}

	@keyframes shine {
		0% { left: -100%; }
		50%, 100% { left: 100%; }
	}

	header::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, #ff0000, #ff3333, #ff6666, #ff3333, #ff0000);
		background-size: 200% 100%;
		animation: gradientShift 3s linear infinite;
	}

	@keyframes gradientShift {
		0% { background-position: 0% 0%; }
		100% { background-position: 200% 0%; }
	}

	.logo-container {
		margin-bottom: 1rem;
		background: white;
		display: inline-block;
		padding: 0.5rem 1.5rem;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0,0,0,0.5);
	}

	.logo {
		height: 80px;
		width: auto;
		display: block;
	}

	h1 {
		margin: 0;
		color: #fff;
		font-size: 2rem;
		text-shadow: 
			2px 2px 4px rgba(0,0,0,0.8), 
			0 0 10px rgba(255,51,51,0.8),
			0 0 20px rgba(255,51,51,0.5),
			0 0 30px rgba(255,51,51,0.3);
		letter-spacing: 2px;
		font-weight: bold;
		text-transform: uppercase;
		animation: textGlow 2s ease-in-out infinite alternate;
	}

	@keyframes textGlow {
		from {
			text-shadow: 
				2px 2px 4px rgba(0,0,0,0.8), 
				0 0 10px rgba(255,51,51,0.8),
				0 0 20px rgba(255,51,51,0.5);
		}
		to {
			text-shadow: 
				2px 2px 4px rgba(0,0,0,0.8), 
				0 0 15px rgba(255,51,51,1),
				0 0 30px rgba(255,51,51,0.8),
				0 0 40px rgba(255,51,51,0.5);
		}
	}

	header p {
		margin: 0.5rem 0 0;
		color: #ffcccc;
		text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
		font-style: italic;
	}

	.filters {
		background: linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%);
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		box-shadow: 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
		border: 1px solid #333;
	}

	.search-wrapper {
		position: relative;
		margin-bottom: 1rem;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		font-size: 0.9rem;
		opacity: 0.6;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 0.75rem 0.75rem 2.5rem;
		font-size: 0.9rem;
		border: 2px solid #555;
		border-radius: 4px;
		box-sizing: border-box;
		background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
		color: #e0e0e0;
		box-shadow: 
			inset 0 2px 4px rgba(0,0,0,0.5),
			inset 0 1px 0 rgba(0,0,0,0.3);
		font-family: 'Courier New', monospace;
		font-weight: bold;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		transition: all 0.2s;
	}

	.search-input::placeholder {
		color: #666;
		font-size: 0.85rem;
		letter-spacing: 0.5px;
	}

	.search-input:focus {
		outline: none;
		border-color: #ff3333;
		box-shadow: 
			inset 0 2px 4px rgba(0,0,0,0.5), 
			0 0 10px rgba(204,0,0,0.5);
		background: linear-gradient(180deg, #1f1f1f 0%, #1a1a1a 100%);
	}

	.active-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: rgba(0,0,0,0.3);
		border-radius: 4px;
		border: 1px solid #444;
	}

	.active-tags-label {
		color: #999;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: bold;
	}

	.active-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.75rem;
		background: linear-gradient(180deg, #cc0000 0%, #990000 100%);
		border: 2px solid #ff3333;
		border-radius: 20px;
		color: #fff;
		font-size: 0.85rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
	}

	.active-tag:hover {
		background: linear-gradient(180deg, #ff0000 0%, #cc0000 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(204,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
	}

	.remove-icon {
		font-size: 1.2rem;
		line-height: 1;
		font-weight: bold;
	}

	.filter-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
	}

	.custom-dropdown {
		position: relative;
	}

	.dropdown-button {
		width: 100%;
		padding: 0.75rem 2rem 0.75rem 0.75rem;
		font-size: 0.85rem;
		border: 2px solid #555;
		border-radius: 4px;
		background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #1f1f1f 100%);
		color: #fff;
		cursor: pointer;
		box-shadow: 
			0 2px 4px rgba(0,0,0,0.5),
			inset 0 1px 0 rgba(255,255,255,0.15),
			inset 0 -1px 0 rgba(0,0,0,0.3);
		font-family: 'Trebuchet MS', sans-serif;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-align: left;
	}

	.dropdown-button:hover {
		border-color: #ff3333;
		background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 50%, #2f2f2f 100%);
		box-shadow: 
			0 0 8px rgba(204,0,0,0.4),
			0 2px 4px rgba(0,0,0,0.5),
			inset 0 1px 0 rgba(255,255,255,0.2),
			inset 0 -1px 0 rgba(0,0,0,0.3);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		min-width: 100%;
		background: linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%);
		border: 2px solid #ff3333;
		border-radius: 4px;
		box-shadow: 
			0 8px 16px rgba(0,0,0,0.8),
			inset 0 1px 0 rgba(255,255,255,0.1),
			0 0 20px rgba(204,0,0,0.3);
		z-index: 1000;
		overflow: hidden;
		animation: slideDown 0.2s ease-out;
		max-height: 300px;
		overflow-y: auto;
	}

	.dropdown-option {
		width: 100%;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-bottom: 1px solid #333;
		color: #ccc;
		text-align: left;
		cursor: pointer;
		font-family: 'Trebuchet MS', sans-serif;
		font-size: 0.85rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.15s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.dropdown-option:last-child {
		border-bottom: none;
	}

	.dropdown-option:hover {
		background: linear-gradient(90deg, rgba(204,0,0,0.2) 0%, transparent 100%);
		color: #fff;
		padding-left: 1.25rem;
	}

	.dropdown-option.active {
		background: linear-gradient(90deg, rgba(204,0,0,0.3) 0%, transparent 100%);
		color: #ff3333;
		border-left: 3px solid #ff3333;
	}

	.dropdown-option.active:hover {
		background: linear-gradient(90deg, rgba(204,0,0,0.4) 0%, transparent 100%);
	}

	.results-count {
		margin-bottom: 1rem;
		color: #999;
		font-size: 0.9rem;
		text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
		font-family: 'Courier New', monospace;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%);
		border-radius: 4px;
		border: 1px solid #333;
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
	}

	.count-text {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.count-text::before {
		content: '»';
		color: #ff3333;
		font-size: 1.2rem;
		text-shadow: 0 0 5px rgba(255,51,51,0.5);
	}

	.sort-dropdown {
		position: relative;
	}

	.sort-button {
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		font-size: 0.85rem;
		border: 2px solid #555;
		border-radius: 4px;
		background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #1f1f1f 100%);
		color: #fff;
		cursor: pointer;
		box-shadow: 
			0 2px 4px rgba(0,0,0,0.5),
			inset 0 1px 0 rgba(255,255,255,0.15),
			inset 0 -1px 0 rgba(0,0,0,0.3);
		font-family: 'Trebuchet MS', sans-serif;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 200px;
		justify-content: space-between;
	}

	.sort-button:hover {
		border-color: #ff3333;
		background: linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 50%, #2f2f2f 100%);
		box-shadow: 
			0 0 8px rgba(204,0,0,0.4),
			0 2px 4px rgba(0,0,0,0.5),
			inset 0 1px 0 rgba(255,255,255,0.2),
			inset 0 -1px 0 rgba(0,0,0,0.3);
	}

	.arrow {
		color: #ff3333;
		font-size: 0.7rem;
		transition: transform 0.2s;
	}

	.sort-button:hover .arrow {
		color: #ff6666;
	}

	.sort-menu {
		position: absolute;
		top: calc(100% + 4px);
		right: 0;
		min-width: 220px;
		background: linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%);
		border: 2px solid #ff3333;
		border-radius: 4px;
		box-shadow: 
			0 8px 16px rgba(0,0,0,0.8),
			inset 0 1px 0 rgba(255,255,255,0.1),
			0 0 20px rgba(204,0,0,0.3);
		z-index: 1000;
		overflow: hidden;
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.sort-option {
		width: 100%;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-bottom: 1px solid #333;
		color: #ccc;
		text-align: left;
		cursor: pointer;
		font-family: 'Trebuchet MS', sans-serif;
		font-size: 0.85rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.15s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sort-option:last-child {
		border-bottom: none;
	}

	.sort-option:hover {
		background: linear-gradient(90deg, rgba(204,0,0,0.2) 0%, transparent 100%);
		color: #fff;
		padding-left: 1.25rem;
	}

	.sort-option.active {
		background: linear-gradient(90deg, rgba(204,0,0,0.3) 0%, transparent 100%);
		color: #ff3333;
		border-left: 3px solid #ff3333;
	}

	.sort-option.active:hover {
		background: linear-gradient(90deg, rgba(204,0,0,0.4) 0%, transparent 100%);
	}

	.check {
		color: #ff3333;
		font-size: 1rem;
		text-shadow: 0 0 5px rgba(255,51,51,0.5);
	}

	.parts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.part-card {
		background: linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%);
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
		display: block;
		border: 2px solid #333;
		position: relative;
		overflow: hidden;
	}

	.part-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, #cc0000, #ff3333, #cc0000);
		opacity: 0;
		transition: opacity 0.2s;
		z-index: 1;
	}

	.part-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 6px 16px rgba(204,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
		border-color: #cc0000;
	}

	.part-card:hover::before {
		opacity: 1;
	}

	.part-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: #000;
		position: relative;
	}

	.part-image::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 100%);
		pointer-events: none;
	}

	.part-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.part-card:hover .part-image img {
		transform: scale(1.1);
	}

	.no-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: 
			linear-gradient(135deg, #1a1a1a 25%, transparent 25%),
			linear-gradient(225deg, #1a1a1a 25%, transparent 25%),
			linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
			linear-gradient(315deg, #1a1a1a 25%, #0f0f0f 25%);
		background-position: 10px 0, 10px 0, 0 0, 0 0;
		background-size: 20px 20px;
		background-repeat: repeat;
	}

	.no-image-text {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		text-align: center;
	}

	.primo-badge {
		font-family: 'Impact', 'Arial Black', sans-serif;
		font-size: 2rem;
		color: #ff3333;
		text-shadow: 
			2px 2px 4px rgba(0,0,0,0.8),
			0 0 10px rgba(255,51,51,0.5);
		letter-spacing: 3px;
	}

	.no-img-label {
		font-family: 'Courier New', monospace;
		font-size: 1rem;
		color: #999;
		font-weight: bold;
		letter-spacing: 2px;
	}

	.available-label {
		font-family: 'Trebuchet MS', sans-serif;
		font-size: 0.75rem;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.part-content {
		padding: 1.5rem;
	}

	.part-card h3 {
		margin: 0 0 0.5rem;
		color: #fff;
		font-size: 1.35rem;
		text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
		font-weight: bold;
		line-height: 1.3;
	}

	.price {
		font-size: 1.5rem;
		font-weight: bold;
		color: #ff3333;
		margin: 0.5rem 0;
		text-shadow: 0 0 10px rgba(255,51,51,0.5), 1px 1px 2px rgba(0,0,0,0.8);
		font-family: 'Impact', 'Arial Black', sans-serif;
		letter-spacing: 1px;
	}

	.description {
		color: #b0b0b0;
		margin: 0.75rem 0;
		line-height: 1.5;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
		border-radius: 12px;
		font-size: 0.85rem;
		color: #ccc;
		border: 1px solid #444;
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
		text-transform: uppercase;
		font-weight: bold;
		letter-spacing: 0.5px;
	}

	.tag-link {
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s;
		background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
		border-color: #555;
		border: 1px solid #555;
	}

	.tag-link:hover {
		background: linear-gradient(180deg, #cc0000 0%, #990000 100%);
		border-color: #ff3333;
		color: #fff;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(204,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
	}

	.tag-link:active {
		transform: translateY(0);
	}

	.condition-excellent {
		background: linear-gradient(180deg, #2d5016 0%, #1f3a0f 100%);
		color: #90ee90;
		border-color: #3a6b1f;
		text-shadow: 0 0 5px rgba(144,238,144,0.5);
	}

	.condition-good {
		background: linear-gradient(180deg, #1a4d5c 0%, #0f3540 100%);
		color: #87ceeb;
		border-color: #2a6b7f;
		text-shadow: 0 0 5px rgba(135,206,235,0.5);
	}

	.condition-fair {
		background: linear-gradient(180deg, #5c4d1a 0%, #403510 100%);
		color: #ffd700;
		border-color: #7f6b2a;
		text-shadow: 0 0 5px rgba(255,215,0,0.5);
	}

	.no-results {
		text-align: center;
		padding: 3rem;
		background: linear-gradient(180deg, #2a2a2a 0%, #1f1f1f 100%);
		border-radius: 8px;
		border: 2px solid #333;
		box-shadow: 0 4px 8px rgba(0,0,0,0.5);
	}

	.no-results p {
		margin-bottom: 1rem;
		color: #999;
	}

	.no-results button {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(180deg, #cc0000 0%, #990000 100%);
		color: white;
		border: 2px solid #ff3333;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		text-transform: uppercase;
		font-weight: bold;
		letter-spacing: 1px;
		box-shadow: 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
		transition: all 0.2s;
	}

	.no-results button:hover {
		background: linear-gradient(180deg, #ff0000 0%, #cc0000 100%);
		box-shadow: 0 6px 12px rgba(204,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
		transform: translateY(-2px);
	}

	@media (max-width: 768px) {
		.container {
			padding: 0.5rem;
		}

		header {
			margin: -0.5rem -0.5rem 1rem;
			padding: 1.5rem 0.5rem;
		}

		.logo {
			height: 60px;
		}

		h1 {
			font-size: 1.5rem;
		}

		.parts-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.filter-row {
			grid-template-columns: 1fr;
		}
	}
</style>
