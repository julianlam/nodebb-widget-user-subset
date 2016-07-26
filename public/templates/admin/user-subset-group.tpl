<textarea class="form-control" rows="6" name="text" placeholder="Enter Text / Markdown"></textarea>
<hr />
<label>Select Group</label>
<select name="groupName" class="form-control">
	<!-- BEGIN groups -->
	<option value="{groups.name}">{groups.name}</option>
	<!-- END groups -->
</select>
<div class="checkbox">
	<label>
		<input type="checkbox" name="parseAsPost" checked />
		Parse as a Post? (Take all post-related plugins into effect)
	</label>
</div>